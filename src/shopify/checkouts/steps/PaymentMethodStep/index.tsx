import {FC} from "react";
import {PaymentMethodFrame} from "@components/frames/PaymentMethodFrame.tsx";
import {useParams} from "react-router-dom";
import {Methods} from "../../../../page/fragments/Checkout/Steps/PaymentMethodStep/Methods.tsx";

export type PaymentMethodStepProps = {};

export const PaymentMethodStep: FC<PaymentMethodStepProps> = (props) => {
    const {} = props;
    const {token} = useParams();
    return <PaymentMethodFrame >
        <Methods token={token!} />
    </PaymentMethodFrame>
};
