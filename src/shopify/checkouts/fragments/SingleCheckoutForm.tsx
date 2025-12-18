import {FC} from "react";
import {ContactInformationStep} from "../../../page/fragments/Checkout/Steps/ContactInformationStep";
import {ShippingMethodStep} from "../steps/ShippingMethodStep";
import {PaymentMethodStep} from "../steps/PaymentMethodStep";
import {SingleFooter} from "./SingleFooter.tsx";
import {PaypalQuicklyButton} from "../../fragments/PaypalQuicklyButton.tsx";
import {UNSAFE_useRouteId} from "react-router-dom";
import {ApproveIt} from "./ApproveIt.tsx";
import {FormItem} from "@components/fragments/FormItem.tsx";

export type SingleCheckoutFormProps = {};

export const PlainField = (props: any) => {
    const {errors,value} = props;
    if(!!value) return null;
    return <div className={'flex flex-row space-y-2 text-red-500'}>
        {(errors||[]).map((error : string,i : number) => {
            return <div key={i}>{errors}</div>
        })}
    </div>
}
export const SingleCheckoutForm: FC<SingleCheckoutFormProps> = (props) => {
    const {} = props;
    // useSyncDeliveryGroups();
    const id = UNSAFE_useRouteId();
    const approve = id === 'approve';
    return <div className={'flex flex-col items-stretch space-y-8'}>
        {!approve && <PaypalQuicklyButton/>}
        <div className={'flex flex-col space-y-8'}>
            <ContactInformationStep/>
            <ShippingMethodStep/>
            <FormItem name={['shipping_line_id']} preserve={true} rules={[{
                required: true,
                'message': 'you must select a delivery method.'
            }]}>
                <PlainField/>
            </FormItem>
            {!approve && <PaymentMethodStep/>}
        </div>
        <FormItem name={'context'} initialValue={id}>
            <input hidden={true} value={id}/>
        </FormItem>
        {approve ? <ApproveIt/> : <SingleFooter/>}
    </div>;
};
