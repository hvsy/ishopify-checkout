import {FC,} from "react";
import {CheckoutContainer} from "../../../../../container/CheckoutContext.ts";
import {Methods} from "./Methods.tsx";
import Big from "big.js";
import {FreeMethod} from "./FreeMethod.tsx";
import {LimitAlert} from "../../../../../container/LimitAlert.tsx";
import {NoActivePaymentMethod} from "./NoActivePaymentMethod.tsx";
import {usePaymentLimit} from "../../../../../container/usePaymentLimit.ts";
import { PaymentError } from "./PaymentError.tsx";

export type PaymentMethodStepProps = {};

export const PaymentMethodStep: FC<PaymentMethodStepProps> = (props) => {
    const {} = props;
    const checkout = CheckoutContainer.use();
    const {limit,alert,total} =usePaymentLimit();
    const methods = alert?  null : (total.cmp(Big(0)) === 0 ? <FreeMethod /> : <Methods token={checkout!.token}/>);
    return <div className={'space-y-4'}>
        <div>
            Payment Method
        </div>
        <div className={'text-sm text-slate-500'}>
            All transactions are secure and encrypted.
        </div>
        <PaymentError />
        {alert && <LimitAlert limit={alert} />}
        {limit ? <div className={`flex flex-col items-stretch border input-border rounded-md divide-y 
                border-neutral-300 divide-neutral-300 overflow-hidden`}>
            <NoActivePaymentMethod />
        </div> :methods}
    </div>;
};
