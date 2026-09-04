import {useCallback, useEffect, useRef, useState} from "react";
import {gql, useMutation} from "@apollo/client";
import {get as _get, uniq as _uniq} from "lodash-es";

import {useCart} from "./useCart.ts";
import {useCheckoutSync} from "./useCheckoutSync.ts";
import {useSummary} from "../shopify/checkouts/hooks/useSummary.tsx";
import {
    QueryBuyerIdentityFragment,
    QueryCartDiscountAllocationFieldsFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryDiscountsFragment,
    QueryErrorsFragment
} from "@query/checkouts/fragments/fragments.ts";
import {MutateDiscountCode} from "@query/checkouts/mutations.ts";

type DiscountStatus = 'idle' | 'applying' | 'success' | 'error';

const DEFAULT_DISCOUNT_ERROR = 'This code did not match any active gift card or discount. Was it entered correctly?';

function toErrorMessage(e: unknown): string {
    if (typeof e === 'string') return e;
    if (typeof e === 'object' && e !== null) {
        const message = (e as {message?: unknown})?.message;
        if (typeof message === 'string' && message.trim()) return message;
    }
    return DEFAULT_DISCOUNT_ERROR;
}

export type UseDiscountCode = {
    /** 当前已应用、且 applicable 的折扣码列表 */
    codes: string[];
    /** 追加一个折扣码（正在应用中或已应用时 no-op） */
    apply: (code: string) => Promise<void>;
    /** 移除一个折扣码（正在应用中时 no-op） */
    remove: (code: string) => Promise<void>;
    status: DiscountStatus;
    error: string | null;
    /** 本次会话内提交失败的折扣码 */
    failedCodes: string[];
    hasFailed: (code: string) => boolean;
};

/**
 * 把"应用/移除折扣码"的核心数据流（mutation + 缓存刷新 + 已生效券列表 + 并发保护 +
 * 失败记录）封装成通用 hook。URL ?discount_code= 自动应用与 discount:apply 的 bus 监听
 * 等入口/路由副作用不在此 hook 内，由消费组件负责。
 */
export function useDiscountCode(): UseDiscountCode {
    const {gid} = useCart();
    const sync = useCheckoutSync();
    const {json: query} = useSummary();

    const [status, setStatus] = useState<DiscountStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [failedCodes, setFailedCodes] = useState<string[]>([]);

    const currentCodes: string[] = _get(query, 'cart.discountCodes', [])
        .filter((d: {applicable?: boolean}) => !!d.applicable)
        .map((item: {code?: string}) => item.code)
        .filter((code: string | undefined): code is string => !!code);

    const [fn] = useMutation(gql([
        MutateDiscountCode,
        QueryDiscountsFragment,
        QueryCartDiscountAllocationFieldsFragment,
        QueryErrorsFragment,
        QueryCartFieldsFragment,
        QueryBuyerIdentityFragment,
        QueryDeliveryFragment,
    ].join("\n")), {
        // 行项目价格/折扣分配会随优惠券变化，单个 CheckoutQuery 已包含
        // Summary / 行项目 / 快递分组，只需 refetch 一次即可全部刷新。
        refetchQueries: ['CheckoutQuery'],
        awaitRefetchQueries: true,
        variables: {
            cartId: gid,
        }
    });

    // 用 ref 保存当前代码/串行队列，令 apply/remove 保持稳定引用，
    // 避免 summary 更新导致消费组件的 useEffect 反复触发。
    const currentCodesRef = useRef(currentCodes);
    const queueRef = useRef<Promise<void> | null>(null);
    const failedRef = useRef<Set<string>>(new Set());

    const enqueue = useCallback((operation: () => Promise<void>) => {
        const previous = queueRef.current || Promise.resolve();
        const next = previous.then(operation, operation);
        queueRef.current = next;
        return next.finally(() => {
            if (queueRef.current === next) {
                queueRef.current = null;
            }
        });
    }, []);

    useEffect(() => {
        if (queueRef.current === null) {
            currentCodesRef.current = currentCodes;
        }
    }, [currentCodes]);

    const hasFailed = useCallback((code: string) => {
        return failedRef.current.has(code);
    }, []);

    const runMutation = useCallback(async (codes: string[]) => {
        setStatus('applying');
        setError(null);
        await fn({
            variables: {
                cartId: gid,
                codes,
            },
            awaitRefetchQueries: true,
        });
        await sync();
    }, [fn, sync, gid]);

    const markFailed = useCallback((code: string) => {
        failedRef.current.add(code);
        setFailedCodes([...failedRef.current]);
    }, []);

    const clearFailed = useCallback((code: string) => {
        if (!failedRef.current.has(code)) return;
        failedRef.current.delete(code);
        setFailedCodes([...failedRef.current]);
    }, []);

    const apply = useCallback((code: string) => {
        if (currentCodesRef.current.includes(code)) return Promise.resolve();
        return enqueue(async () => {
            if (currentCodesRef.current.includes(code)) return;
            try {
                await runMutation(_uniq([...currentCodesRef.current, code]));
                currentCodesRef.current = _uniq([...currentCodesRef.current, code]);
                setStatus('success');
                clearFailed(code);
            } catch (e) {
                markFailed(code);
                setStatus('error');
                setError(toErrorMessage(e));
                throw e;
            }
        });
    }, [enqueue, runMutation, markFailed, clearFailed]);

    const remove = useCallback((code: string) => {
        return enqueue(async () => {
            if (!currentCodesRef.current.includes(code)) return;
            try {
                await runMutation(_uniq(currentCodesRef.current.filter(c => c !== code)));
                currentCodesRef.current = _uniq(currentCodesRef.current.filter(c => c !== code));
                setStatus('success');
            } catch (e) {
                setStatus('error');
                setError(toErrorMessage(e));
                throw e;
            }
        });
    }, [enqueue, runMutation]);

    return {
        codes: currentCodes,
        apply,
        remove,
        status,
        error,
        failedCodes,
        hasFailed,
    };
}
