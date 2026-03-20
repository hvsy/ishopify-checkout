import {FC,} from "react";
import {FooterFrame} from "@components/frames/FooterFrame.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {shopify_payment} from "../../lib/payment.ts";
import {usePaymentContext,} from "../../../container/PaymentContext.tsx";
import {useParams} from "react-router-dom";
import {useFormValidate} from "../../hooks/useFormValidate.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {Features} from "@lib/flags.ts";

export type SingleFooterProps = {};

const AutoFillSuggestCode = Features.includes('auto-fill-suggest-zip');
export const SingleFooter: FC<SingleFooterProps> = (props) => {
    const {} = props;
    const {token} = useParams();
    const {ing} = useSummary();
    const {method, setProgress, suggestZipCode} = usePaymentContext() || {};
    const form = useCurrentForm();
    const validator = useFormValidate(form);
    return <FooterFrame
        back={{
            to: '/cart',
            reload: true,
            label: 'Cart',
        }}

        next={{
            label: 'Place an order',
            pulsing: ing,
            async onClick() {

                setProgress?.(() => {
                    return "before form validator";
                });
                try {
                    if (AutoFillSuggestCode && !!suggestZipCode) {
                        const zipErrors = form.getFieldsError([
                            ['shipping_address', 'zip'],
                            ['billing_address', 'zip']
                        ]);
                        if (zipErrors.length > 0) {
                            form.setFields(
                                zipErrors.map((error) => {
                                    return {
                                        name: error.name,
                                        value: suggestZipCode,
                                    };
                            }));
                        }
                    }
                } catch (e) {

                }

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
                const {data, values} = after;
                const result = await shopify_payment({
                    summary: data,
                    values: {
                        ...values,
                        token: token
                    },
                    method: method!,
                }, setProgress)
                console.log(result, values);
            }
        }}
    />;
};
