import {FormInstance} from "@rc-component/form";
import {
    AddressResolver,
    MirrorSnapshot,
    SyncDomain,
    SyncIntent,
    allowedDomainsOf,
    billingOfForm,
    buildMutationInput,
    cartFingerprint,
    clearedAddressFieldsOfFormChange,
    diffDomains,
    formPatchFromCart,
    isCartReady,
    isPartialAddress,
    lowerEmail,
    mergeCartSnapshot,
    mirrorDiffers,
    mirrorFromMeta,
    mirrorOfForm,
    MUTATION_DOMAINS,
} from "./domains.ts";

/** 一次 cycle 的产出，调用方（尤其是支付路径）据此决定是否继续 */
export type SyncCycleResult = {
    intents: SyncIntent[];
    domains: SyncDomain[];
    /** null 表示本轮确实走了流程；否则是跳过原因（cart-not-ready / mutation-dropped） */
    skipped: string | null;
    mutated: boolean;
    /** applied / noop / stale / failed / skipped */
    put: string;
    cart: any;
    billing_address: any;
    userErrors: any[];
    warnings: any[];
    /** 传输层错误（mutation 或 PUT 都没成功） */
    error: string | null;
    revision: number;
    fingerprint: string | null;
    /** 镜像专属字段（email / 账单 / 本地化）是否与库里不一致 */
    mirrorChanged: boolean;
    duration: number;
};

export type SyncRunOptions = {
    /** approve 页需要保留 buyerIdentity.countryCode */
    keepBuyerCountryCode?: boolean;
};

export type CheckoutSyncDeps = {
    token: string;
    form: FormInstance;
    /** Shopify mutation（来自 ShopifyCheckoutContext.update） */
    mutate: (input: any, partialUpdate?: boolean, force?: boolean, keepBuyerCountryCode?: boolean) => Promise<any>;
    /** 读 Apollo 缓存里的 cart，可能为 null */
    readCart: () => any;
    /** 等 CheckoutQuery 就绪（拿不到 cart 时） */
    waitForCart?: () => Promise<void>;
    /** 地址变更前等待 Summary 就绪，避免 DUPLICATE_DELIVERY_ADDRESS */
    waitForSummary?: () => Promise<void>;
    /** PHP 镜像 PUT */
    put: (payload: Record<string, any>) => Promise<any>;
    /** 遥测（produce），失败不影响主流程 */
    telemetry?: (action: string, payload: Record<string, any>) => void;
    /** 服务端注入的已确认状态 */
    initialRevision?: number;
    initialHash?: string | null;
    /** 服务端注入的镜像专属字段（sync_mirror meta） */
    initialMirror?: any;
    /** 地址写入的校验强度（COUNTRY_CODE_ONLY / STRICT），按 intent 决定：flush 保持严格 */
    validationStrategy?: (intents: SyncIntent[]) => string | undefined;
    /** 配送国家/省份解析器（补省份 / 改写不支持国家时用），与页面同一份 zones 数据 */
    addressResolver?: AddressResolver;
};

/** 一次用户手势里的连续变更合并窗口 */
const QUIET_MS = 200;
/** 镜像 PUT 的重试退避（只作用于 PUT，不作用于 Shopify mutation） */
const PUT_RETRY_DELAYS = [500, 2000, 8000];
/** 服务端返回 stale 时，同一个 cycle 内允许用更大 revision 重发的次数 */
const STALE_RETRIES = 1;

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function jitter(ms: number) {
    return ms + Math.floor(Math.random() * Math.max(120, ms * 0.25));
}

function emptyResult(intents: SyncIntent[]): SyncCycleResult {
    return {
        intents,
        domains: [],
        skipped: null,
        mutated: false,
        put: 'skipped',
        cart: null,
        billing_address: null,
        userErrors: [],
        warnings: [],
        error: null,
        revision: 0,
        fingerprint: null,
        mirrorChanged: false,
        duration: 0,
    };
}

/**
 * Checkout 同步的唯一编排者。
 *
 * 不变量：
 *  1. 一个 intent = 一个 cycle = 恰好一次 PHP 镜像 PUT（可能包含 0 或 1 次 Shopify mutation）；
 *  2. delivery 域只能由 delivery intent 写；
 *  3. PUT 的载荷永远是 mutation 返回的 cart；
 *  4. 无差异不发请求；
 *  5. 镜像 PUT 失败只标记脏，不阻塞支付。
 */
export class CheckoutSyncManager {
    private readonly deps: CheckoutSyncDeps;
    private pending = new Set<SyncIntent>();
    private pendingKeepBuyerCountryCode = false;
    private timer: any = null;
    private drainPromise: Promise<SyncCycleResult | undefined> | null = null;
    private lastResult: SyncCycleResult | null = null;
    private revision: number;
    private syncedHash: string | null;
    /** 客户端对"库里镜像专属字段"的信念，PUT 成功后更新 */
    private syncedMirror: MirrorSnapshot;
    private localCounter = 0;
    private dirty = false;
    private disposed = false;
    /** 是否有 cycle 在途；UI 用它决定"骨架加载中"而不是直接判定无快递方式 */
    private running = false;
    private listeners = new Set<() => void>();
    /** 用户主动清空的地址字段（投影名）。只有这些字段才允许把 null 写回 Shopify（P1-7） */
    private clearedAddressFields = new Set<string>();

    constructor(deps: CheckoutSyncDeps) {
        this.deps = deps;
        this.revision = Number.isFinite(Number(deps.initialRevision)) ? Number(deps.initialRevision) : 0;
        this.syncedHash = deps.initialHash || null;
        this.syncedMirror = mirrorFromMeta(deps.initialMirror);
    }

    /** 声明一次变更；不会立即发请求，等待静止窗口后合并执行 */
    request(intent: SyncIntent) {
        if (this.disposed) return;
        this.pending.add(intent);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.kick().catch((e) => {
                console.error('[sync] cycle failed:', e);
            });
        }, QUIET_MS);
    }

    /**
     * 记录用户在表单里主动清空的地址字段（来自 rc-form onValuesChange 的 changedValues.shipping_address）。
     * 返回是否出现新的清空——调用方据此补一次 address cycle，否则"清空"永远不同步（P1-7）。
     */
    noteAddressEdits(changed: any): boolean {
        if (this.disposed) return false;
        const cleared = clearedAddressFieldsOfFormChange(changed);
        if (cleared.length === 0) return false;
        cleared.forEach((field) => this.clearedAddressFields.add(field));
        return true;
    }

    /** 表单邮箱是否已与"库里镜像的邮箱"一致（P2-2：blur 短路必须同时看镜像，不能只看 cart） */
    mirrorEmailMatches(email: string): boolean {
        return lowerEmail(email) === (this.syncedMirror.email || '');
    }

    /** 立即执行（支付前 / 页面隐藏），会等待在途 cycle 结束 */
    async flush(intent: SyncIntent = 'flush', options: SyncRunOptions = {}): Promise<SyncCycleResult> {
        if (this.disposed) return this.fallbackResult([intent]);
        clearTimeout(this.timer);
        this.pending.add(intent);
        if (options.keepBuyerCountryCode) {
            this.pendingKeepBuyerCountryCode = true;
        }
        const running = this.drainPromise;
        if (running) {
            try {
                await running;
            } catch (e) {
                // 在途 cycle 的错误由它自己记录，这里继续处理剩余变更
            }
        }
        if (this.pending.size > 0) {
            try {
                await this.kick();
            } catch (e) {
                console.error('[sync] flush failed:', e);
            }
        }
        return this.lastResult || this.fallbackResult([intent]);
    }

    get pendingCount() {
        return this.pending.size;
    }

    get isDirty() {
        return this.dirty;
    }

    get currentRevision() {
        return this.revision;
    }

    get isRunning() {
        return this.running;
    }

    /** 订阅"在途状态"变化；返回取消订阅函数。manager 不是响应式的，UI 侧自行镜像成 state */
    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private setRunning(value: boolean) {
        if (this.running === value) return;
        this.running = value;
        this.listeners.forEach((listener) => {
            try {
                listener();
            } catch (e) {
                // 订阅方自己的异常不能影响同步主流程
            }
        });
    }

    dispose() {
        this.disposed = true;
        clearTimeout(this.timer);
        this.pending.clear();
        this.listeners.clear();
    }

    /** 等缓存里的 cart 变完整（缺 deliveryGroups / lines 时不算就绪） */
    private async awaitReadyCart(timeoutMs = 3000): Promise<any> {
        const deadline = Date.now() + timeoutMs;
        let cart = this.deps.readCart() || null;
        while (!isCartReady(cart) && Date.now() < deadline) {
            await sleep(100);
            cart = this.deps.readCart() || null;
        }
        return cart;
    }

    /** 没有跑成 cycle 时的兜底：至少把缓存里的 cart 带回去，别让支付路径拿到 null */
    private fallbackResult(intents: SyncIntent[]): SyncCycleResult {
        const result = emptyResult(intents);
        try {
            result.cart = this.deps.readCart() || null;
        } catch (e) {
            result.cart = null;
        }
        result.revision = this.revision;
        return result;
    }

    private kick(): Promise<SyncCycleResult | undefined> {
        if (this.drainPromise) return this.drainPromise;
        if (this.pending.size === 0) return Promise.resolve(undefined);
        this.setRunning(true);
        const task = this.drain();
        const wrapped = task.finally(() => {
            if (this.drainPromise === wrapped) {
                this.drainPromise = null;
            }
            this.setRunning(false);
        });
        this.drainPromise = wrapped;
        return wrapped;
    }

    /** 单飞：同一时刻只有一个 cycle；期间到来的请求并入下一轮（尾部合并） */
    private async drain(): Promise<SyncCycleResult | undefined> {
        let result: SyncCycleResult | undefined;
        while (this.pending.size > 0) {
            const intents = [...this.pending];
            this.pending.clear();
            clearTimeout(this.timer);
            const keepBuyerCountryCode = this.pendingKeepBuyerCountryCode;
            this.pendingKeepBuyerCountryCode = false;
            try {
                result = await this.execute(intents, {keepBuyerCountryCode});
            } catch (e: any) {
                console.error('[sync] execute error:', e);
                result = {
                    ...this.fallbackResult(intents),
                    error: e?.message || String(e),
                };
                this.dirty = true;
            }
            this.lastResult = result;
        }
        return result;
    }

    private async execute(intents: SyncIntent[], options: SyncRunOptions): Promise<SyncCycleResult> {
        const startedAt = Date.now();
        const uniqueIntents = [...new Set(intents)];
        const allowed = allowedDomainsOf(uniqueIntents);
        const values = this.deps.form.getFieldsValue(true) || {};

        // A：cycle 必须建立在完整快照上。首屏时缓存可能先有 cart.id、后才有
        // deliveryGroups/lines，用它算指纹会把残缺 cart 写进镜像并触发一次多余的 PUT。
        let cart = this.deps.readCart() || null;
        // discount 也要等：指纹算在残缺 cart 上会跳过本次镜像，而折扣没有别的补发路径（P2-7）
        if (!isCartReady(cart)) {
            await this.deps.waitForCart?.();
            cart = this.deps.readCart() || null;
        }
        if (!isCartReady(cart)) {
            const result: SyncCycleResult = {
                ...this.fallbackResult(uniqueIntents),
                skipped: 'cart-not-ready',
                duration: Date.now() - startedAt,
            };
            this.dirty = true;
            this.report(result);
            return result;
        }

        // 一级基线：表单生效值 vs Shopify 购物车
        const domains = diffDomains(values, cart, allowed, {
            clearedAddressFields: this.clearedAddressFields,
        });
        const mutationDomains = domains.filter((domain) => MUTATION_DOMAINS.includes(domain));

        let response: any = null;
        let mutated = false;
        if (mutationDomains.length > 0) {
            if (mutationDomains.includes('address')) {
                // 只等 Summary 就绪（避免 DUPLICATE_DELIVERY_ADDRESS）。
                // 不再清空 deliveryGroups 缓存：置 null 会让快递方式整块变成骨架再恢复
                // （点支付时补同步地址也会触发），mutation 之后的 refetch 会就地更新选项。
                await this.deps.waitForSummary?.();
            }
            const input = buildMutationInput(values, mutationDomains, cart, {
                validationStrategy: this.deps.validationStrategy?.(uniqueIntents),
                clearedAddressFields: this.clearedAddressFields,
                addressResolver: this.deps.addressResolver,
            });
            // approve 页：PayPal 回传的完整地址是经 preset 注入表单的，可能比首屏 hydrate
            // 晚一拍（实测先写 {US,AL}、约 2.8s 后才是完整地址）。中间那次只带国家/省份的
            // 写入几百毫秒后就会被覆盖，白写一次 Shopify + 一次镜像 PUT，所以这里直接跳过；
            // 注入完整地址后的那次 hydrate（或支付 flush）会真正写入。
            if (mutationDomains.includes('address')
                && values?.context === 'approve'
                && isPartialAddress(input.shipping_address)) {
                const pending: SyncCycleResult = {
                    ...this.fallbackResult(uniqueIntents),
                    domains,
                    skipped: 'approve-address-pending',
                    duration: Date.now() - startedAt,
                };
                this.dirty = true;
                this.report(pending);
                return pending;
            }
            // approve 页必须保留 buyerIdentity.countryCode（与旧逻辑一致）
            const keepBuyerCountryCode = !!options.keepBuyerCountryCode || values?.context === 'approve';
            // force=true：mutation 已经由 PQueue 串行化，force 只会放行"上一条还在 loading"的
            // 假阳性，不放行就变成静默丢写（P1-4）
            response = await this.deps.mutate(input, true, true, keepBuyerCountryCode);
            mutated = true;
        }

        // UpdateMutationCallback 在 mutation 仍在 loading 时会直接 return undefined：
        // 这时 Shopify 什么都没写，必须当失败处理并保留脏标记，否则会用没变的缓存 cart
        // 算出"指纹命中"，把这次改动静默丢掉（P1-4）。
        if (mutated && (response === undefined || response === null)) {
            const dropped: SyncCycleResult = {
                ...this.fallbackResult(uniqueIntents),
                domains,
                mutated: true,
                skipped: 'mutation-dropped',
                error: 'shopify mutation dropped',
                duration: Date.now() - startedAt,
            };
            this.dirty = true;
            this.report(dropped);
            return dropped;
        }

        const userErrors = (response?.userErrors || []) as any[];
        const warnings = (response?.warnings || []) as any[];
        // mutation 返回的 cart 不含 lines / deliveryGroups，必须与缓存里的完整 cart 合并，
        // 否则镜像 remote_data 会丢掉行项目（后端报 "checkout items empty"）和快递分组。
        const cachedCart = this.deps.readCart() || cart;
        let nextCart = response?.cart
            ? mergeCartSnapshot(cachedCart, response.cart)
            : cachedCart;
        if (!nextCart?.id) {
            nextCart = cachedCart;
        }
        if (mutated && Object.keys(nextCart || {}).length > 0) {
            const patch = formPatchFromCart(nextCart);
            if (Object.keys(patch).length > 0) {
                this.deps.form.setFieldsValue(patch);
            }
        }

        const result: SyncCycleResult = {
            intents: uniqueIntents,
            domains,
            skipped: null,
            mutated,
            put: 'skipped',
            cart: nextCart,
            billing_address: billingOfForm(values),
            userErrors,
            warnings,
            error: null,
            revision: this.revision,
            fingerprint: null,
            mirrorChanged: false,
            duration: 0,
        };

        if (userErrors.length > 0) {
            // Shopify 拒绝了这次写入：不动基线，保持脏标记，由上层（支付）决定是否中止
            this.dirty = true;
            result.duration = Date.now() - startedAt;
            this.report(result);
            return result;
        }

        // C：兜底——即使到这一步快照仍不完整，也绝不写残缺镜像，保持脏标记等下一轮补
        if (!isCartReady(nextCart)) {
            nextCart = (await this.awaitReadyCart()) || nextCart;
        }
        if (!isCartReady(nextCart)) {
            this.dirty = true;
            result.cart = nextCart;
            result.skipped = 'cart-not-ready';
            result.put = 'skipped';
            result.duration = Date.now() - startedAt;
            this.report(result);
            return result;
        }
        result.cart = nextCart;

        // 二级基线：cart 指纹 vs 服务端已确认哈希，外加镜像专属字段 vs 注入的 sync_mirror。
        // 两者任一不同都要 PUT：镜像专属字段不进指纹，否则"只改账单/邮箱"会被 noop 吞掉（Y 方案）。
        const fingerprint = cartFingerprint(nextCart);
        result.fingerprint = fingerprint;
        const mirrorChanged = mirrorDiffers(values, this.syncedMirror);
        result.mirrorChanged = mirrorChanged;
        if (fingerprint !== this.syncedHash || mirrorChanged) {
            result.put = await this.putWithRetry(nextCart, values, uniqueIntents, fingerprint);
            // 镜像行不存在：支付路径必须中止，不能拿着没写进去的改动继续扣款（见 useFormValidate）
            if (result.put === 'missing') {
                result.skipped = 'checkout-missing';
            }
        } else {
            this.dirty = false;
        }
        result.revision = this.revision;
        result.duration = Date.now() - startedAt;
        this.report(result);
        return result;
    }

    private async putWithRetry(cart: any, values: any, intents: SyncIntent[], fingerprint: string): Promise<string> {
        const revision = this.nextRevision();
        const email = String(values?.email || '').trim();
        const billing = billingOfForm(values);
        const payload: Record<string, any> = {
            remote_data: cart,
            revision,
            hash: fingerprint,
            source: intents.join('+'),
            quickly: !email,
        };
        if (email) {
            payload.email = email;
        }
        if (values?.localization) {
            payload.localization = values.localization;
        }
        // 表单没有账单时整段省略：服务端 findCheckout()->fill() 不动这个字段，
        // 否则会把库里已存的账单地址覆盖成 null（安全规则）。
        if (billing) {
            payload.billing_address = billing;
        }
        let attempt = 0;
        let staleRetries = 0;
        for (;;) {
            try {
                const response = await this.deps.put(payload);
                // api() 对 404 返回 null：服务端用 404 表示"checkout 行不存在"（P2-13 起 PUT 不再建行）。
                // 这是不可重试的致命态——行不会自己回来，重试只会让支付白等 10.5s（PUT_RETRY_DELAYS）。
                if (response === null || response === undefined) {
                    this.dirty = true;
                    return 'missing';
                }
                const status = String(response?.status || 'applied');
                const serverRevision = Number(response?.revision);
                if (Number.isFinite(serverRevision)) {
                    this.revision = Math.max(this.revision, serverRevision);
                } else {
                    this.revision = Math.max(this.revision, payload.revision as number);
                }
                const serverHash = response?.synced_hash || null;
                if (status === 'stale') {
                    // 服务端已有更新的写入：同 cycle 内用更大 revision 重发一次（P1-5），
                    // 超过重试次数才保留脏标记等下一轮
                    this.syncedHash = serverHash || this.syncedHash;
                    if (staleRetries < STALE_RETRIES) {
                        staleRetries++;
                        payload.revision = this.nextRevision();
                        continue;
                    }
                    this.dirty = true;
                    return 'stale';
                }
                this.syncedHash = serverHash || fingerprint;
                // 信念更新：服务端现在应该就是我们刚发出去的内容。
                // 没带 email / localization 时服务端保持原值，所以沿用旧信念，
                // 避免服务端丢弃（validate_email 不通过）时每个 cycle 都重发。
                const sent = mirrorOfForm(values);
                this.syncedMirror = {
                    email: sent.email || this.syncedMirror.email,
                    billing: sent.billing || this.syncedMirror.billing,
                    localization: sent.localization || this.syncedMirror.localization,
                };
                this.dirty = false;
                return status === 'noop' ? 'noop' : 'applied';
            } catch (e: any) {
                if (attempt >= PUT_RETRY_DELAYS.length) {
                    this.dirty = true;
                    console.error('[sync] mirror put failed:', e);
                    return 'failed';
                }
                await sleep(jitter(PUT_RETRY_DELAYS[attempt]));
                attempt++;
            }
        }
    }

    private nextRevision(): number {
        const next = Math.max(this.revision, this.localCounter) + 1;
        this.localCounter = next;
        return next;
    }

    private report(result: SyncCycleResult) {
        if (!this.deps.telemetry) return;
        try {
            this.deps.telemetry('sync_cycle', {
                intent: result.intents.join('+'),
                domains: result.domains,
                skipped: result.skipped,
                mutated: result.mutated,
                put: result.put,
                user_errors: result.userErrors.length,
                error: result.error,
                revision: result.revision,
                mirror_changed: result.mirrorChanged,
                dirty_after: this.dirty,
                duration: result.duration,
            });
        } catch (e) {
            // 遥测失败不影响主流程
        }
    }
}
