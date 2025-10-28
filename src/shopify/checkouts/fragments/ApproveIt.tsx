import {FC, useEffect} from "react";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {scrollToError, } from "@components/frames/FormContainer.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {api} from "@lib/api.ts";
import {useFormValidate} from "../../hooks/useFormValidate.tsx";
import {PromiseLocation} from "../../lib/payment.ts";
import {get as _get} from "lodash-es";

export type ApproveItProps = {};

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
    return <AsyncButton
        pulsing={ing}
        onClick={async () => {
            const after = await submit();
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
            }
        }}
        className={'max-w-full'}>Place an order</AsyncButton> ;
};
