import {FC, } from "react";
import {ContactInformationStep} from "../../../page/fragments/Checkout/Steps/ContactInformationStep";
import {ShippingMethodStep} from "../steps/ShippingMethodStep";
import {PaymentMethodStep} from "../steps/PaymentMethodStep";
import {useParams} from "react-router-dom";
import {StandardFormFrame} from "@components/frames/StandardFormFrame.tsx";

export type CheckoutFormProps = {};

const ChildrenComponents : any = {
    'information' : ContactInformationStep,
    'shipping': ShippingMethodStep,
    'payment' : PaymentMethodStep,
};
import {NavBar} from "@components/frames/StandardNavigationBarFrame.tsx";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {useSummary} from "../hooks/useSummary.tsx";
import {CheckoutFooter} from "./CheckoutFooter.tsx";
import {useCartStorage} from "@hooks/useCartStorage.ts";

export const CheckoutForm: FC<CheckoutFormProps> = (props) => {
    const {} = props;

    const {action = 'information',token} = useParams();

    const {json} = useSummary();
    const checkout  = getCheckoutFromSummary(json,'cart');
    const cart = useCartStorage();
    const basename = cart.basename;
    const format = useMoneyFormat();
    let bars : NavBar[] = []
    if(action !== 'information'){
        bars.push({
            label : "Contact",
            value : checkout.email,
            href : basename,
        },{
            label : "Ship To",
            value : checkout.ship_to,
            href : basename,
        });
    }
    if(action === 'payment'){
        const amount = checkout.shipping_discount?.discountedAmount?.amount;
        const cost = checkout.shipping_line?.estimatedCost;
        bars.push({
            label : 'Shipping Method',
            value : <div className={'flex flex-row items-center space-x-1'}>
                <span>
                    {checkout.shipping_line?.title}
                </span>
                <span>·</span>
                <span>
                    {amount === cost?.amount ? <span className={'font-bold'}>FREE</span> : format(cost)}
                </span>
            </div>,
            href : `${basename}/shipping`
        })
    }
    return <StandardFormFrame ChildrenComponents={ChildrenComponents} bars={bars}>
            <CheckoutFooter checkout={checkout}/>
        </StandardFormFrame>;
};
