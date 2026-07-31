import {FC, ReactNode} from "react";
import {FreeMethod} from "../../page/fragments/Checkout/Steps/PaymentMethodStep/FreeMethod.tsx";
import {PaymentError} from "../../page/fragments/Checkout/Steps/PaymentMethodStep/PaymentError.tsx";
import {get as _get} from "lodash-es";
import {StepFrame} from "./StepFrame.tsx";
import {useSummary} from "../../shopify/checkouts/hooks/useSummary.tsx";

export type PaymentMethodFrameProps = {
    children ?: ReactNode;
};

export const PaymentMethodFrame: FC<PaymentMethodFrameProps> = (props) => {
    let {children} = props;
    const {json, loading} = useSummary();
    const total = _get(json,'cart.cost.totalAmount.amount',0);
    if(!loading.summary && !parseFloat(total)){
        children = <FreeMethod />;
    }
    return <StepFrame title={"Payment Method"}
                      description={"All transactions are secure and encrypted."}>
        <PaymentError />
        {children}
    </StepFrame>;
};
