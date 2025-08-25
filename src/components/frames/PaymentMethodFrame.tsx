import {FC} from "react";
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

export type PaymentMethodFrameProps = {};

export const PaymentMethodFrame: FC<PaymentMethodFrameProps> = (props) => {
    const {} = props;
    const {token} = useParams();
    // const {ref} = useLoaderData() as any;
    const {ref} = useRouteLoaderData('checkout') as any;
    const data = useReadQuery(ref) as any;
    const total = _get(data,'data.cart.cost.totalAmount.amount',0);
    // const {limit,alert,total} =usePaymentLimit();
    let methods= null;
    if(!parseFloat(total)){
        methods = <FreeMethod />;
    }else{
        methods = <Methods token={token!} />
    }


    // const methods = alert?  null : (total.cmp(Big(0)) === 0 ? <FreeMethod /> : <Methods token={checkout!.token}/>);
    return <StepFrame title={"Payment Method"}
                      description={"All transactions are secure and encrypted."}>
        <PaymentError />
        {methods}
        {/*{alert && <LimitAlert limit={alert} />}*/}
        {/*{limit ? <div className={`flex flex-col items-stretch border input-border rounded-md divide-y */}
        {/*        border-neutral-300 divide-neutral-300 overflow-hidden`}>*/}
        {/*    <NoActivePaymentMethod />*/}
        {/*</div> :methods}*/}
    </StepFrame>;;
};
