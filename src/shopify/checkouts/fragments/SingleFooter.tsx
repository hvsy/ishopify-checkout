import {FC, } from "react";
import {FooterFrame} from "@components/frames/FooterFrame.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {shopify_payment} from "../../lib/payment.ts";
import {usePaymentMethod} from "../../../container/PaymentContext.tsx";
import {useParams} from "react-router-dom";
import {useFormValidate} from "../../hooks/useFormValidate.tsx";
import {useShopifyCheckoutLoading} from "../../context/ShopifyCheckoutContext.tsx";

export type SingleFooterProps = {};

export const SingleFooter: FC<SingleFooterProps> = (props) => {
    const {} = props;
    const {token} = useParams();
    const {ing} = useSummary();
    const loading = useShopifyCheckoutLoading();
    const method = usePaymentMethod();
    const validator = useFormValidate();
    return <FooterFrame
        back={{
            to : '/cart',
            reload : true,
            label : 'Cart',
        }}

        next={{
            label : 'Payment',
            pulsing : ing || loading,
            async onClick() {
                const after = await validator();
                if(!after) return;
                const {data,values} = after;
                const result = await shopify_payment({
                    summary : data,
                    values:{
                        ...values,
                        token : token
                    },
                    method : method!,
                })
                console.log(result,values);
            }
        }}
    />;
};
