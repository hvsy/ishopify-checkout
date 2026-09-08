import {FC} from "react";
import {usePaymentContext} from "../../container/PaymentContext.tsx";
import {Divider} from "@components/ui/Divider.tsx";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {api, getFinalPath} from "@lib/api.ts";
import {useSummary} from "../checkouts/hooks/useSummary.tsx";
import {useCart} from "@hooks/useCart.ts";
import {PaypalButton} from "./PaypalButton.tsx";
import {PromiseLocation} from "../lib/promiseLocation.ts";
import {useCheckoutSyncManager} from "../sync/CheckoutSyncContext.tsx";

export type PaypalQuicklyButtonProps = {};

export const PaypalQuicklyButton: FC<PaypalQuicklyButtonProps> = (props) => {
    const {} = props;
    const {methods} = usePaymentContext() || {};
    const {ing} = useSummary();
    const {api: cartApi} = useCart();
    const method = (methods || []).find((method) => {
        return method.type === 'paypal';
    });
    // 快捷支付前先把未落库的变更 flush 一次，避免后端用过期镜像建 PayPal 订单
    const syncManager = useCheckoutSyncManager();
    if (!method) {
        return null;
    }
    if(import.meta.env.VITE_SKELETON){
        return null;
    }
    return <div className={'flex flex-col items-stretch space-y-5'}>
        <PaypalButton
            onClick={async () => {
                if (syncManager) {
                    try {
                        await syncManager.flush('flush');
                    } catch (e) {
                        // 镜像/校验失败不阻断快捷支付（Express 会自己收集地址）
                        console.error('flush before quickly failed:', e);
                    }
                }
                const res = await api({
                    method : "post",
                    'url' : cartApi + '/quickly'
                });
                if(!res?.error) {
                    const id = res?.id;
                    if(!!id) {
                        await PromiseLocation(getFinalPath(`/api/transactions/${id}/redirect?quickly=1`));
                    }
                }
            }}
        />
        <Divider>
            <span className={'text-[#333333] opacity-60'}>OR</span>
        </Divider>
    </div>
};
