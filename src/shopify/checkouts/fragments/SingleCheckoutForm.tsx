import {FC} from "react";
import {ContactInformationStep} from "../../../page/fragments/Checkout/Steps/ContactInformationStep";
import {ShippingMethodStep} from "../steps/ShippingMethodStep";
import {PaymentMethodStep} from "../steps/PaymentMethodStep";
import {SingleFooter} from "./SingleFooter.tsx";
import {PaypalQuicklyButton} from "../../fragments/PaypalQuicklyButton.tsx";
import {UNSAFE_useRouteId} from "react-router-dom";
import {ApproveIt} from "./ApproveIt.tsx";

export type SingleCheckoutFormProps = {};

export const SingleCheckoutForm: FC<SingleCheckoutFormProps> = (props) => {
    const {} = props;
    // useSyncDeliveryGroups();
    const id = UNSAFE_useRouteId();
    const approve = id === 'approve';
    return <div className={'flex flex-col items-stretch space-y-8'}>
        {!approve && <PaypalQuicklyButton />}
        <div className={'flex flex-col space-y-8'}>
            <ContactInformationStep/>
            <ShippingMethodStep/>
            { !approve && <PaymentMethodStep/>}
        </div>
        {approve ? <ApproveIt />:<SingleFooter />}
    </div>;
};
