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

export type ApproveItProps = {};

const FloatApprove = Features.includes('float_approve_button');
export const ApproveIt: FC<ApproveItProps> = (props) => {
    const {} = props;
    const {ing,storage} = useSummary();
    const form = useCurrentForm();
    useEffect(() => {
        form.validateFields().then(() => {

        }, (error) => {
            console.error(error);
            scrollToError(error);
        });
    }, []);
    const submit = useFormValidate();
    const float_approve_class = FloatApprove ? 'fixed bottom-0 left-0 right-0 py-1 px-1 sm:static sm:left-auto sm:right-auto sm:bottom-auto sm:px-0 sm:py-0 z-50' : '';
    return <div className={`flex flex-col items-stretch ${float_approve_class}`}>
        <AsyncButton
            pulsing={ing}
            onClick={async () => {
                const after = await submit(true);
                if(!after) return;
                const handle=  _get(after?.data,'deliveryGroups.edges.0.node.selectedDeliveryOption.handle');
                if(!handle){
                    alert('Please select the delivery method.')
                    throw "please choice delivery shipping line";
                }
                console.log(after);
                const res = await api({
                    method : "post",
                    'url' : storage!.api + `/approve`,
                });
                if(!res['error']){
                    const url = res.url;
                    if(!!url){
                        await PromiseLocation(url);
                    }
                }else{
                    if(!!res.redirect){
                        await PromiseLocation(res.redirect);
                    }else if(!!res.url){
                        await PromiseLocation(res.url);
                    }
                }
            }}
            className={`max-w-full text-xl sm:text-lg h-12`}>Place an order</AsyncButton>
    </div>;
};
