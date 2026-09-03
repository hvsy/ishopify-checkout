import {useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";

import {useDiscountCode, UseDiscountCode} from "./useDiscountCode.ts";
import {useBusListener} from "../bus.tsx";

/**
 * 折扣码业务逻辑入口：组合核心数据流（useDiscountCode）与"入口副作用"。
 *
 * 由于 ShopifyCouponForm 在移动端默认折叠、RightFrame 会直接 unmount 其 children，
 * 若把 bus 监听 / ?discount_code= 自动应用放在表单组件内，移动端折叠时这些副作用
 * 不会生效。本 hook 若在 RightFrame 外层（Right）调用一次，即可保证无论表单是否
 * 挂载，折扣码都能被外部入口（PayPal recall）与 URL 参数触发。
 *
 * 返回值透传 useDiscountCode 的完整形状；ShopifyCouponForm 仅消费 codes/apply/remove。
 */
export function useDiscountCodeManager(): UseDiscountCode {
    const discount = useDiscountCode();
    const {apply, status, hasFailed} = discount;
    const [search] = useSearchParams();
    const navigate = useNavigate();
    const discountCode = search.get('discount_code');

    // 外部入口（如 PayPal recall 返回的券）通过 bus 触发应用。
    // 这里不做 applying 拦截：useDiscountCode 内部通过串行队列等待当前操作结束，
    // 并且失败会 reject，从而阻止 recall 在折扣码未生效前继续跳转。
    useBusListener("discount:apply", async (code?: string) => {
        if (!code) return;
        await apply(code);
    });

    // URL ?discount_code= 自动应用；成功后清掉参数，失败则保留参数排查
    useEffect(() => {
        if (!discountCode || status === 'applying' || hasFailed(discountCode)) return;
        apply(discountCode).then(() => {
            const newSearch = new URLSearchParams(search);
            newSearch.delete('discount_code');
            navigate({search: newSearch.toString()}, {replace: true});
        }).catch((e) => {
            // 券无效或接口失败：本次会话不再自动重试，并保留 url 参数方便排查
            console.error('auto apply discount_code failed:', discountCode, e);
        });
    }, [discountCode, status, hasFailed, apply, navigate, search]);

    return discount;
}
