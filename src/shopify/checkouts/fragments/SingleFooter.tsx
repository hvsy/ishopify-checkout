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

export type SingleFooterProps = {};

export const SingleFooter: FC<SingleFooterProps> = (props) => {
    const {} = props;
    const {token} = useParams();
    const {ing} = useSummary();
    const {method, setProgress,} = usePaymentContext() || {};
    const form = useCurrentForm();
    const validator = useFormValidate(form);
    const referer = Features.includes('return:referer') ? document.referrer.toString() : null;
    return <FooterFrame
        back={{
            to: referer || '/cart',
            reload: true,
            label: 'Cart',
        }}

        next={{
            label: getMetaContent('payment_title') || 'Place an order',
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
