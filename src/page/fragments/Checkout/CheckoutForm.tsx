import {FC, lazy} from "react";
import {NavigationBar} from "../NavigationBar.tsx";
import Form from "rc-field-form";
import {FooterNav} from "./FooterNav.tsx";
import {SingleFooter} from "./SingleFooter.tsx";
import {useParams} from "react-router-dom";
import {CheckoutContainer} from "../../../container/CheckoutContext.ts";
import {ContactInformationStep} from "./Steps/ContactInformationStep";
import {ShippingMethodStep} from "./Steps/ShippingMethodStep";
import {PaymentMethodStep} from "./Steps/PaymentMethodStep";

export type CheckoutFormProps = {};
const ChildrenComponents : any = {
    'information' : ContactInformationStep,
    'shipping': ShippingMethodStep,
    'payment' : PaymentMethodStep,
};

export const CheckoutForm: FC<CheckoutFormProps> = (props) => {
    const {} = props;
    const checkout = CheckoutContainer.use()!;
    const page_style = checkout.shop?.preference?.checkout?.page_style || 'standard'
    const {action = 'information'} = useParams();
    const ChildrenComponent = ChildrenComponents[action];
    return page_style === 'standard' ? <>
        <NavigationBar />
        <Form.Field name={['shipping_address']} preserve={true}>
            <div className={'hidden'} />
        </Form.Field>
        <Form.Field name={['payment_method_id']} preserve={true}>
            <div className={'hidden'}/>
        </Form.Field>
        <Form.Field name={['shipping_insurance']} preserve={true}>
            <div className={'hidden'} />
        </Form.Field>
        <ChildrenComponent />
        <FooterNav />
    </> : <div className={'flex flex-col space-y-8 items-stretch'}>
        {Object.keys(ChildrenComponents).map((key) => {
            const Component = ChildrenComponents[key];
            return <div className={'flex flex-col items-stretch space-y-6'} key={key}>
                <Component key={key}/>
            </div>
        })}
        <SingleFooter url={checkout.url}/>
    </div>
};
