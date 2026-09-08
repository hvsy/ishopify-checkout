import {get as _get, omit as _omit} from "lodash-es";
import {sha256} from "js-sha256";
import {ValidatePhone} from "../lib/helper.ts";

/**
 * 同步域：一个域 = 一组可以独立判定"是否发生变化"的字段。
 * 域的划分决定了"只改了 email 不会被算成快递方式变了"。
 */
export type SyncDomain = 'identity' | 'address' | 'delivery' | 'discount' | 'billing' | 'localization';

/**
 * 同步意图：一次用户手势或一次系统动作。
 * 一次 intent = 一个 sync cycle = 恰好一次 PHP 镜像 PUT。
 */
export type SyncIntent = 'hydrate' | 'address' | 'delivery' | 'identity' | 'discount' | 'flush';

/**
 * 每个 intent 允许写入 Shopify 的域。
 * 关键约束：
 *  1. 只有 delivery 能写 delivery（cartSelectedDeliveryOptionsUpdate）；
 *  2. flush（支付点击 / 页面隐藏）永远不写 delivery，否则就是"点支付重发快递方式"的老 bug。
 */
export const INTENT_DOMAINS: Record<SyncIntent, SyncDomain[]> = {
    hydrate: ['address'],
    address: ['address'],
    delivery: ['delivery'],
    identity: ['identity'],
    discount: ['discount'],
    flush: ['identity', 'address', 'discount'],
};

/** 会触发 Shopify mutation 的域；discount 由折扣 mutation 自己写，这里只负责镜像 */
export const MUTATION_DOMAINS: SyncDomain[] = ['identity', 'address', 'delivery'];

/** 合并多个 intent 允许的域 */
export function allowedDomainsOf(intents: SyncIntent[]): SyncDomain[] {
    const all = new Set<SyncDomain>();
    (intents || []).forEach((intent) => {
        (INTENT_DOMAINS[intent] || []).forEach((domain) => all.add(domain));
    });
    return [...all];
}

const EMPTY = '';

function str(value: any): string {
    if (value === null || value === undefined) return EMPTY;
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    return EMPTY;
}

function lower(value: any): string {
    return str(value).toLowerCase();
}

/** 邮箱归一化（导出给 manager/组件做镜像比较，避免各处重复 trim+lowercase） */
export function lowerEmail(value: any): string {
    return lower(value);
}

function digits(value: any): string {
    return str(value).replace(/\D+/g, '');
}

function zipKey(value: any): string {
    return str(value).toUpperCase().replace(/\s+/g, '');
}

function codeKey(value: any): string {
    return str(value).toUpperCase();
}

/** 取表单里的电话号码（兼容 phone2 对象），并沿用 buildAddress 的合法性判定 */
export function phoneOf(address: any, validate: boolean = true): string {
    const source = address || {};
    const phone2 = source.phone2;
    let phone = str(source.phone);
    if (phone2 && typeof phone2 === 'object') {
        if (typeof phone2.getFullPhone === 'function') {
            try {
                const full = phone2.getFullPhone();
                if (full) phone = String(full).trim();
            } catch (e) {
                // ignore
            }
        } else if (typeof phone2.toString === 'function' && phone2.toString() !== '[object Object]') {
            try {
                const text = phone2.toString();
                if (text && text !== '[object Object]') phone = text.trim();
            } catch (e) {
                // ignore
            }
        }
    }
    if (validate && !ValidatePhone(phone || '')) {
        return EMPTY;
    }
    return phone;
}

/** 电话号码比较：容忍国家码前缀/分隔符差异，避免"永远对不上"导致重复写 */
export function phoneEquals(left: any, right: any): boolean {
    const a = digits(left);
    const b = digits(right);
    if (!a || !b) return !a && !b;
    if (a === b) return true;
    if (a.length >= 6 && b.length >= 6) {
        return a.endsWith(b) || b.endsWith(a);
    }
    return false;
}

export type AddressProjection = {
    id: string;
    city: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    phone: string;
    countryCode: string;
    provinceCode: string;
    zip: string;
};

const ADDRESS_FIELDS: (keyof AddressProjection)[] = [
    'city', 'firstName', 'lastName', 'address1', 'address2', 'phone', 'countryCode', 'provinceCode', 'zip',
];

/** 表单侧的地址投影（用于比较与构造 mutation 输入） */
export function addressOfForm(values: any): AddressProjection {
    const shipping = _get(values, 'shipping_address', {}) || {};
    return {
        id: str(shipping.id),
        city: str(shipping.city),
        firstName: str(shipping.first_name),
        lastName: str(shipping.last_name),
        address1: str(shipping.line1),
        address2: str(shipping.line2),
        phone: phoneOf(shipping, true),
        countryCode: codeKey(shipping.region_code),
        provinceCode: codeKey(shipping.state_code),
        zip: str(shipping.zip),
    };
}

/** Shopify 购物车侧的地址投影 */
export function addressOfCart(cart: any): AddressProjection {
    const selected = _get(cart, 'delivery.addresses.0', {}) || {};
    const address = selected.address || {};
    return {
        id: str(selected.id),
        city: str(address.city),
        firstName: str(address.firstName),
        lastName: str(address.lastName),
        address1: str(address.address1),
        address2: str(address.address2),
        phone: str(address.phone),
        countryCode: codeKey(address.countryCode),
        provinceCode: codeKey(address.provinceCode),
        zip: str(address.zip),
    };
}

export type DomainValues = {
    identity: { email: string };
    address: AddressProjection;
    delivery: { groupId: string, handle: string };
    discount: { codes: string[] };
    billing: any;
    localization: any;
};

/** 表单生效值 → 各域投影 */
export function domainsOfForm(values: any): DomainValues {
    const shipping = _get(values, 'shipping_address', {}) || {};
    const billing = _get(values, 'billing_address', null);
    return {
        identity: { email: lower(values?.email) },
        address: addressOfForm(values),
        delivery: {
            groupId: str(values?.shipping_group_id),
            handle: str(values?.shipping_line_id),
        },
        discount: { codes: [] },
        billing: billing ? _omit(billing, ['region', 'state']) : null,
        localization: values?.localization || null,
    };
}

/** Shopify 购物车 → 各域投影（billing / localization 不在购物车里，只进镜像） */
export function domainsOfCart(cart: any): DomainValues {
    const group = _get(cart, 'deliveryGroups.edges.0.node', null);
    const codes = (_get(cart, 'discountCodes', []) || [])
        .filter((item: any) => !!item?.applicable)
        .map((item: any) => str(item?.code))
        .filter(Boolean)
        .sort();
    return {
        identity: { email: lower(_get(cart, 'buyerIdentity.email')) },
        address: addressOfCart(cart),
        delivery: {
            groupId: str(group?.id),
            handle: str(_get(group, 'selectedDeliveryOption.handle')),
        },
        discount: { codes },
        billing: null,
        localization: null,
    };
}

/** 表单字段（snake_case）→ 地址投影字段 */
const ADDRESS_FORM_FIELD_MAP: Record<string, keyof AddressProjection> = {
    city: 'city',
    first_name: 'firstName',
    last_name: 'lastName',
    line1: 'address1',
    line2: 'address2',
    phone: 'phone',
    phone2: 'phone',
    region_code: 'countryCode',
    state_code: 'provinceCode',
    zip: 'zip',
};

/** 国家不能清空（Shopify 地址必须有国家），其余字段都允许用户清空 */
const UNCLEARABLE_ADDRESS_FIELDS = new Set<string>(['countryCode']);

/**
 * 从 rc-form 的 `changedValues.shipping_address` 里挑出"用户主动清空"的字段（返回投影名）。
 * 只用于用户输入（onValuesChange 不会被 setFieldsValue 触发），因此能把
 * "用户清空"与"尚未回填"区分开——这正是 P1-7 的判据。
 */
export function clearedAddressFieldsOfFormChange(changed: any): string[] {
    if (!changed || typeof changed !== 'object') return [];
    const out = new Set<string>();
    const isEmptyValue = (value: any) => {
        if (value === null || value === undefined || value === '') return true;
        if (typeof value === 'object' && !Array.isArray(value)) return Object.keys(value).length === 0;
        return false;
    };
    // phone / phone2 走同一份判定（phone2 是对象，清空后 getFullPhone 为空）
    if ('phone' in changed || 'phone2' in changed) {
        if (!phoneOf({phone: changed.phone, phone2: changed.phone2}, false)) {
            out.add('phone');
        }
    }
    Object.keys(changed).forEach((key) => {
        if (key === 'phone' || key === 'phone2') return;
        const field = ADDRESS_FORM_FIELD_MAP[key];
        if (!field || UNCLEARABLE_ADDRESS_FIELDS.has(field)) return;
        if (isEmptyValue(changed[key])) out.add(field);
    });
    return [...out];
}

function addressDiffers(form: AddressProjection, cart: AddressProjection, cleared: Set<string>): boolean {
    for (const field of ADDRESS_FIELDS) {
        const left = form[field];
        // 表单里为空的字段默认不算差异（还没填/还没回填，不能拿空值覆盖远端）；
        // 但用户主动清空、且远端确实有值时必须算差异，否则清空永远同步不过去（P1-7）
        if (!left) {
            if (cleared.has(field) && !!cart[field]) return true;
            continue;
        }
        if (field === 'phone') {
            if (!phoneEquals(left, cart[field])) return true;
            continue;
        }
        if (field === 'zip') {
            if (zipKey(left) !== zipKey(cart[field])) return true;
            continue;
        }
        if (left !== cart[field]) return true;
    }
    return false;
}

/**
 * 一级基线：表单生效值 vs Shopify 购物车。
 * 只比较 allowed 里的域，且只比较表单里非空的字段。
 */
export function diffDomains(values: any, cart: any, allowed: SyncDomain[],
                            options: { clearedAddressFields?: Iterable<string> } = {}): SyncDomain[] {
    const form = domainsOfForm(values);
    const remote = domainsOfCart(cart);
    const cleared = new Set<string>(options.clearedAddressFields || []);
    const result: SyncDomain[] = [];
    allowed.forEach((domain) => {
        switch (domain) {
            case 'identity':
                if (!!form.identity.email && form.identity.email !== remote.identity.email) {
                    result.push(domain);
                }
                break;
            case 'address':
                if (addressDiffers(form.address, remote.address, cleared)) {
                    result.push(domain);
                }
                break;
            case 'delivery':
                if (!!form.delivery.handle && form.delivery.handle !== remote.delivery.handle) {
                    result.push(domain);
                }
                break;
            case 'discount':
                // 折扣由 discount mutation 自己写，这里只做镜像，不参与 mutation 差异
                break;
            case 'billing':
            case 'localization':
                // 只进 PHP 镜像，不写 Shopify
                break;
        }
    });
    return result;
}

/**
 * 构造 Shopify mutation 输入。
 * 注意：deliveryHandle / deliveryGroupId 只会在 delivery 域里出现，
 * 因此任何非 delivery 的 cycle 都不可能带上 cartSelectedDeliveryOptionsUpdate。
 */
export function buildMutationInput(values: any, domains: SyncDomain[], cart: any,
                              options: { validationStrategy ?: string, clearedAddressFields?: Iterable<string> } = {}) {
    const form = domainsOfForm(values);
    const remote = domainsOfCart(cart);
    const cleared = new Set<string>(options.clearedAddressFields || []);
    const input: any = {};
    if (domains.includes('identity')) {
        input.email = str(values?.email);
    }
    if (domains.includes('address')) {
        const address: any = {};
        // 换国家时，旧国家的省份 / 邮编对新地址就是脏数据，绝不能再拿远端兜底：
        // US→DE 时表单已清空 state_code，若兜底会把 provinceCode: CA 一起发出去，
        // Shopify 直接回 "Province is invalid"（P1-3）。
        const countryChanged = !!form.address.countryCode
            && form.address.countryCode !== remote.address.countryCode;
        // 其余字段：表单有值就用表单，没有就用远端兜底，避免空值把远端地址清掉
        ADDRESS_FIELDS.forEach((field) => {
            // 用户主动清空的字段必须显式发 null，且**不能**再走远端兜底，
            // 否则等于把用户清掉的值又写回去（P1-7）
            if (!form.address[field] && cleared.has(field)) {
                address[field] = null;
                return;
            }
            const staleAfterCountryChange = countryChanged
                && (field === 'provinceCode' || field === 'zip');
            const value = form.address[field] || (staleAfterCountryChange ? EMPTY : remote.address[field]);
            if (value) address[field] = value;
        });
        const id = form.address.id || remote.address.id;
        if (id) address.id = id;
        input.shipping_address = address;
        // 沿用老路径的地址校验强度：phone.validate=required 时只校验国家码，否则 STRICT（P2-4）
        if (options.validationStrategy) {
            input.validationStrategy = options.validationStrategy;
        }
    }
    if (domains.includes('delivery')) {
        const groupId = form.delivery.groupId || remote.delivery.groupId;
        const handle = form.delivery.handle || remote.delivery.handle;
        if (groupId && handle) {
            input.deliveryGroupId = groupId;
            input.deliveryHandle = handle;
        }
    }
    return input;
}

/** 镜像快照：只写 PHP、不回 Shopify cart 的字段 */
export type MirrorSnapshot = {
    email: string;
    billing: any | null;
    localization: any | null;
};

const BILLING_PROJECTION_KEYS = ['city', 'firstName', 'lastName', 'address1', 'address2', 'countryCode', 'provinceCode', 'zip'];

/** 账单地址规范化投影：丢掉 id / region / state / 空 phone 等噪声，便于与库里的值比较 */
export function billingProjection(value: any) {
    if (!value || typeof value !== 'object') return null;
    const out: any = {};
    BILLING_PROJECTION_KEYS.forEach((key) => {
        out[key] = str(value[key]);
    });
    const phone = str(value.phone);
    if (phone) out.phone = phone;
    return out;
}

/** 表单侧 → 镜像快照 */
export function mirrorOfForm(values: any): MirrorSnapshot {
    return {
        email: lower(values?.email),
        billing: billingProjection(billingOfForm(values)),
        localization: values?.localization || null,
    };
}

/** 服务端注入的 sync_mirror meta → 镜像快照 */
export function mirrorFromMeta(mirror: any): MirrorSnapshot {
    return {
        email: lower(mirror?.email),
        billing: billingProjection(mirror?.billing_address),
        localization: mirror?.localization || null,
    };
}

/**
 * 二级基线（二）：镜像专属字段是否与库里不一致。
 * 只在"表单确实提供了值"时比较：
 *  - 表单没邮箱 / 没本地化 → PUT 载荷不带该字段、服务端保持原值，不算差异；
 *  - 表单没账单 → 不支持主动清空（安全规则：回填失败时绝不把库里账单抹掉）。
 */
export function mirrorDiffers(values: any, remote: MirrorSnapshot): boolean {
    const current = mirrorOfForm(values);
    if (!!current.email && current.email !== remote.email) return true;
    if (!!current.localization && stableStringify(current.localization) !== stableStringify(remote.localization)) return true;
    if (!!current.billing && stableStringify(current.billing) !== stableStringify(remote.billing)) return true;
    return false;
}

/** 库里的账单地址（camelCase）→ 表单字段（snake_case），用于首屏回填 */
export function billingToForm(mirrorBilling: any) {
    if (!mirrorBilling || typeof mirrorBilling !== 'object') return null;
    const mapping: Record<string, string> = {
        city: 'city',
        firstName: 'first_name',
        lastName: 'last_name',
        address1: 'line1',
        address2: 'line2',
        countryCode: 'region_code',
        provinceCode: 'state_code',
        zip: 'zip',
    };
    const out: any = {};
    Object.keys(mapping).forEach((key) => {
        const value = str(mirrorBilling[key]);
        if (value) out[mapping[key]] = value;
    });
    return Object.keys(out).length > 0 ? out : null;
}

/** 账单地址（只进镜像） */
export function billingOfForm(values: any) {
    const billing = _get(values, 'billing_address', null);
    if (!billing) return null;
    const source = _omit(billing, ['region', 'state']);
    const address: any = {
        city: str(source.city),
        firstName: str(source.first_name),
        lastName: str(source.last_name),
        address1: str(source.line1),
        address2: str(source.line2),
        countryCode: codeKey(source.region_code),
        provinceCode: codeKey(source.state_code),
        zip: str(source.zip),
    };
    const phone = phoneOf(source, false);
    if (phone) address.phone = phone;
    return address;
}

function stableStringify(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) {
        return '[' + value.map(stableStringify).join(',') + ']';
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value).sort();
        return '{' + keys.map((key) => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
    }
    return JSON.stringify(value);
}

function hashOf(value: any): string {
    return sha256(stableStringify(value));
}

/**
 * 二级基线（一）：cart 指纹。
 * 只覆盖"Shopify 真值"——会回传给 cart 接口、会被 mutation 改变的内容。
 * 镜像专属字段（email / 账单 / 本地化）不在这里，见 mirrorDiffers。
 * 与服务端回传的 sync_hash 比较，决定这次还要不要发 PUT。
 */
export function cartFingerprint(cart: any): string {
    const remote = domainsOfCart(cart);
    const lines = _get(cart, 'lines.edges', []) || [];
    return hashOf({
        identity: remote.identity,
        address: remote.address,
        delivery: remote.delivery,
        discount: remote.discount,
        // 行数 / 数量 / 总额：后端 Shop::findCheckout 拿 lines.edges + cost.totalAmount 当真，
        // 不覆盖它们的话"数量变了但镜像没更新"会被指纹判成没变（P2-5）。
        lines: {
            count: Array.isArray(lines) ? lines.length : 0,
            quantity: Number(_get(cart, 'totalQuantity', 0)) || 0,
        },
        cost: {
            amount: str(_get(cart, 'cost.totalAmount.amount')),
            currency: str(_get(cart, 'cost.totalAmount.currencyCode')),
        },
    });
}

/**
 * 镜像快照是否完整。
 * 首屏 / mutation 之后 Apollo 缓存可能只写了一半（cart 有 id 但缺 deliveryGroups 或 lines），
 * 用它算出来的指纹是错的，写进镜像还会丢快递方式/行项目，所以任何一次 cycle
 * 都必须等到完整快照再决策。
 */
export function isCartReady(cart: any): boolean {
    if (!cart || typeof cart !== 'object' || !cart.id) return false;
    if (!cart.lines || !Array.isArray(cart.lines.edges)) return false;
    if (!cart.deliveryGroups || !Array.isArray(cart.deliveryGroups.edges)) return false;
    // 指纹（cartFingerprint）还要读这些字段：缓存里缺任何一项都会算错指纹、
    // 也会把 email 当成空（多发一次 cartBuyerIdentityUpdate），所以必须一起作为完整性判据。
    // 用 'in' 判断"字段存在"而不是真值判断：buyerIdentity 可能是 null（新购物车还没邮箱）。
    for (const key of ['buyerIdentity', 'delivery', 'cost', 'totalQuantity', 'discountCodes']) {
        if (!(key in cart)) return false;
    }
    return true;
}

/**
 * mutation 返回的 cart 是"部分 cart"：buildCheckoutMutation 只展开
 * CartFields / Delivery / BuyerIdentity，**不含 lines 和 deliveryGroups**。
 * 直接拿它当 remote_data 会让后端判定 "checkout items empty"（Shop::findCheckout），
 * 也会丢掉快递分组。因此以"最新缓存的完整 cart"为底，用 mutation 返回的字段覆盖上去。
 */
export function mergeCartSnapshot(base: any, patch: any): any {
    if (!base) return patch || base;
    if (!patch || typeof patch !== 'object') return base;
    const merged: any = {...base, ...patch};
    ['buyerIdentity', 'delivery', 'cost'].forEach((key) => {
        if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
            merged[key] = {...(base[key] || {}), ...patch[key]};
        }
    });
    if (!patch.lines && base.lines) {
        merged.lines = base.lines;
    }
    if (!patch.deliveryGroups && base.deliveryGroups) {
        merged.deliveryGroups = base.deliveryGroups;
    }
    return merged;
}

/**
 * 把 Shopify 返回的地址 id / 快递方式写回表单。
 * 必须是嵌套对象：rc-form 的 setFieldsValue 用 lodash merge，
 * 点号路径会被当成字面 key。程序化写入不会触发 onValuesChange。
 */
export function formPatchFromCart(cart: any): Record<string, any> {
    const patch: Record<string, any> = {};
    const address = addressOfCart(cart);
    if (address.id) {
        patch.shipping_address = {id: address.id};
    }
    const group = _get(cart, 'deliveryGroups.edges.0.node', null);
    if (group?.id) {
        patch.shipping_group_id = group.id;
    }
    const handle = _get(group, 'selectedDeliveryOption.handle');
    if (handle) {
        patch.shipping_line_id = handle;
    }
    return patch;
}
