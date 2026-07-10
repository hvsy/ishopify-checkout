import {FC,} from "react";
import {FooterFrame} from "@components/frames/FooterFrame.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {shopify_payment} from "../../lib/payment.ts";
import {usePaymentContext,} from "../../../container/PaymentContext.tsx";
import {useParams} from "react-router-dom";
import {useFormValidate} from "../../hooks/useFormValidate.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {getMetaContent} from "@lib/metaHelper.ts";
import {Features} from "@lib/flags.ts";
import {Bus} from "../../../bus.tsx";
import {get as _get} from "lodash-es";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";
import {LoadingContainer} from "@components/fragments/LoadingContainer.tsx";

export type SingleFooterProps = {};

const ShowTotalInButton = Features.includes("payment:show_total")
export const SingleFooter: FC<SingleFooterProps> = (props) => {
    const {} = props;
    const {token} = useParams();
    const {ing,json,loading,} = useSummary();
    const {method, setProgress,} = usePaymentContext() || {};
    const form = useCurrentForm();
    const validator = useFormValidate(form);
    const referer = Features.includes('return:referer') ? document.referrer.toString() : null;
    const total = _get(json, 'cart.cost.totalAmount')
    const format = useMoneyFormat();
    const money = format(total);
    const title = getMetaContent('payment_title') || 'Place an order';
    return <FooterFrame
        back={{
            to: referer || '/cart',
            reload: true,
            label: 'Cart',
        }}

        next={{
            label:<div className={'flex flex-row space-x-2 items-center'}>
                <span>{title}</span>
                {ShowTotalInButton && <LoadingContainer loading={ing || loading.shipping_methods||loading.summary}>{money}</LoadingContainer>}
            </div>,
            pulsing: ing,
            async onClick() {
                setProgress?.(() => {
                    return "before form validator";
                });

                const after = await validator();
                if (!after) {
                    setProgress?.(() => {
                        return "form validator failed";
                    });
                    return;
                }
                setProgress?.(() => {
                    return "pass form validator";
                });
                await Bus.emitAsync("payment:ing",method?.type || true);
                try {
                    const {data, values} = after;
                    const result = await shopify_payment({
                        summary: data,
                        values: {
                            ...values,
                            token: token
                        },
                        method: method!,
                    }, setProgress)
                    import.meta.env.DEV && console.log(result, values);
                } finally {
                    await Bus.emitAsync("payment:end");
                }
            }
        }}
    />;
};
