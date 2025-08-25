import {FC} from "react";
import {FooterFrame} from "@components/frames/FooterFrame.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {submit} from "@components/frames/FormContainer.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {shopify_payment} from "../../lib/payment.ts";
import {usePaymentMethod} from "../../../container/PaymentContext.tsx";
import {useMutationCheckout} from "../../context/ShopifyCheckoutContext.tsx";

export type SingleFooterProps = {};

export const SingleFooter: FC<SingleFooterProps> = (props) => {
    const {} = props;
    const form = useCurrentForm();
    const {ing} = useSummary();
    const sync = useCheckoutSync();
    const method = usePaymentMethod();
    const mutation = useMutationCheckout();
    return <FooterFrame
        back={{
            to : '/cart',
            reload : true,
            label : 'Cart',
        }}

        next={{
            label : 'Payment',
            pulsing : ing,
            async onClick() {
                const values =await submit(form);
                if(!values){
                    return;
                }
                await mutation(values);
                const  {request : data} = (await sync()) || {};
                const result = await shopify_payment({
                    summary : data,
                    values,
                    method : method!,
                })
                console.log(result,values);
            }
        }}
    />;
};
