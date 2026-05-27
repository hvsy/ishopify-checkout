import {FC, useEffect} from "react";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {scrollToError, } from "@components/frames/FormContainer.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {api} from "@lib/api.ts";
import {useFormValidate} from "../../hooks/useFormValidate.tsx";
import {PromiseLocation} from "../../lib/payment.ts";
import {get as _get} from "lodash-es";
import {Features} from "@lib/flags.ts";
import {usePaymentContext} from "../../../container/PaymentContext.tsx";
import {getMetaContent} from "@lib/metaHelper.ts";
import {summary2Cart} from "../../lib/helper.ts";
import {useParams} from "react-router-dom";

export type ApproveItProps = {};

const AutoFillSuggestCode = Features.includes('auto-fill-suggest-zip');
const FloatApprove = Features.includes('float_approve_button');

const payment_title = getMetaContent('payment_title') || 'Place an order'
export const ApproveIt: FC<ApproveItProps> = (props) => {
    const {} = props;
    const {ing,storage,json : summary} = useSummary();
    const form = useCurrentForm();
    const {token} = useParams();
    useEffect(() => {
        form.validateFields().then(() => {

        }, (error) => {
            console.error(error);
            scrollToError(error);
        });
    }, []);
    const {setProgress,suggestZipCode} = usePaymentContext() ||{};
    const submit = useFormValidate(form);
    const float_approve_class = FloatApprove ? 'fixed bottom-0 left-0 right-0 py-1 px-1 sm:static sm:left-auto sm:right-auto sm:bottom-auto sm:px-0 sm:py-0 z-50' : '';
    return <div className={`flex flex-col items-stretch ${float_approve_class}`}>
        <AsyncButton
            pulsing={ing}
            onClick={async () => {
                const after = await submit(true);
                if(!after) {
                    setProgress?.(() => {
                        return "after validate failed";
                    })
                    return;
                }
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
                const handle=  _get(after?.data,'deliveryGroups.edges.0.node.selectedDeliveryOption.handle');
                if(!handle){
                    setProgress?.(() => {
                        return "Please select the delivery method.";
                    })
                    alert('Please select the delivery method.')
                    throw "please choice delivery shipping line";
                }
                import.meta.env.DEV && console.log(after);
                try {
                    const totalAmount = _get(summary, 'cost.totalAmount');
                    const {amount, currencyCode} = totalAmount;
                    window.report?.("add_payment_info", {
                        price: amount + '',
                        currency: currencyCode,
                        cart: summary2Cart(summary),
                        email: after.values.email,
                        shipping_address: after.values.shipping_address,
                        billing_address: after.values.billing_address || after.values.shipping_address,
                    }, token + '_add_payment_info');
                } catch (e) {
                }
                const res = await api({
                    method : "post",
                    'url' : storage!.api + `/approve`,
                });
                if(!!res['error']){
                    setProgress?.(() => {
                        return "approve error";
                    })
                }
                if(!!res?.url){
                    await PromiseLocation(res.url);
                }else if(!!res?.redirect){
                    await PromiseLocation(res.redirect);
                }else{
                    setProgress?.(() => {
                        return "response missing url";
                    })
                }
            }}
            className={`max-w-full text-xl sm:text-lg h-12`}>{payment_title}</AsyncButton>
    </div>;
};
