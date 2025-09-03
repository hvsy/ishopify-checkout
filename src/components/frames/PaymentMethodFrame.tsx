import {FC, ReactNode} from "react";
import {usePaymentLimit} from "../../container/usePaymentLimit.ts";
import Big from "big.js";
import {FreeMethod} from "../../page/fragments/Checkout/Steps/PaymentMethodStep/FreeMethod.tsx";
import {Methods} from "../../page/fragments/Checkout/Steps/PaymentMethodStep/Methods.tsx";
import {PaymentError} from "../../page/fragments/Checkout/Steps/PaymentMethodStep/PaymentError.tsx";
import {LimitAlert} from "../../container/LimitAlert.tsx";
import {NoActivePaymentMethod} from "../../page/fragments/Checkout/Steps/PaymentMethodStep/NoActivePaymentMethod.tsx";
import {useLoaderData, useParams, useRouteLoaderData} from "react-router-dom";
import {useReadQuery} from "@apollo/client";
import {get as _get} from "lodash-es";
import {StepFrame} from "./StepFrame.tsx";

export type PaymentMethodFrameProps = {
    children ?: ReactNode;
};

export const PaymentMethodFrame: FC<PaymentMethodFrameProps> = (props) => {
    let {children} = props;
    const {ref} = useRouteLoaderData('checkout') as any;
    const data = useReadQuery(ref) as any;
    const total = _get(data,'data.cart.cost.totalAmount.amount',0);
    if(!parseFloat(total)){
        children = <FreeMethod />;
    }
    return <StepFrame title={"Payment Method"}
                      description={"All transactions are secure and encrypted."}>
        <PaymentError />
        {children}
    </StepFrame>;
};
