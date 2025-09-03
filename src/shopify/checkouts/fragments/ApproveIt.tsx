import {FC, useEffect} from "react";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {scrollToError, submit} from "@components/frames/FormContainer.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {useMutationCheckout} from "../../context/ShopifyCheckoutContext.tsx";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {api} from "@lib/api.ts";
import {useFormValidate} from "../../hooks/useFormValidate.tsx";
import {PromiseLocation} from "../../lib/payment.ts";

export type ApproveItProps = {};

export const ApproveIt: FC<ApproveItProps> = (props) => {
    const {} = props;
    const {ing,storage} = useSummary();
    const form = useCurrentForm();
    const mutation = useMutationCheckout();
    const sync = useCheckoutSync();
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
        className={'max-w-full'}>Payment</AsyncButton> ;
};
