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

/**
 * 同步在途状态。manager 是普通类（非响应式），provider 把它镜像成 React state，
 * 供快递方式区块决定"骨架加载中"——有 cycle 在途时不能直接判定"没有快递方式"。
 */
export const CheckoutSyncStatusContext = createContext<{syncing: boolean}>({syncing: false});

export function useCheckoutSyncStatus() {
    return use(CheckoutSyncStatusContext);
}
