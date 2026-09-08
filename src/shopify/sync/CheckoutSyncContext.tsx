import {createContext, use} from "react";
import {CheckoutSyncManager} from "./CheckoutSyncManager.ts";

/**
 * 同步管理器由 ShopifyCheckoutProvider 创建（那里同时拿得到 form 和 Shopify mutation）。
 * 开关关闭时为 null，调用点回退到旧逻辑。
 */
export const CheckoutSyncContext = createContext<CheckoutSyncManager | null>(null);

export function useCheckoutSyncManager() {
    return use(CheckoutSyncContext);
}
