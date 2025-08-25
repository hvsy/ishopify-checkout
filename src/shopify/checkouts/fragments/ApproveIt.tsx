import {FC, useEffect} from "react";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {scrollToError, submit} from "@components/frames/FormContainer.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {useMutationCheckout} from "../../context/ShopifyCheckoutContext.tsx";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {api} from "@lib/api.ts";

export type ApproveItProps = {};

export const ApproveIt: FC<ApproveItProps> = (props) => {
    const {} = props;
    const {ing,storage} = useSummary();
    console.log('approve it ing:',ing);
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
    return <AsyncButton
        pulsing={ing}
        onClick={async () => {
            const values = await submit(form);
            console.log('values:',values);
            if(values){
                await mutation(values);
                await sync();
                const res = await api({
                    method : "post",
                    'url' : storage!.api + `/approve`,
                });
                if(!res['error']){
                    const url = res.url;
                    if(!!url){
                        window.location = url;
                    }
                }

            }
        }}
        className={'max-w-full'}>Payment</AsyncButton> ;
};
