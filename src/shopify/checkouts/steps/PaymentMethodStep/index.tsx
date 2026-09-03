import {FC} from "react";
import {PaymentMethodFrame} from "@components/frames/PaymentMethodFrame.tsx";
import {Methods} from "../../../../page/fragments/Checkout/Steps/PaymentMethodStep/Methods.tsx";

export type PaymentMethodStepProps = {};

export const PaymentMethodStep: FC<PaymentMethodStepProps> = (props) => {
    const {} = props;
    return <PaymentMethodFrame >
        <Methods />
    </PaymentMethodFrame>
};
