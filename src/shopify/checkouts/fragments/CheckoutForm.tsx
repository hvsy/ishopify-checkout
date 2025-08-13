import {FC, useMemo} from "react";
import {ContactInformationStep} from "../../../page/fragments/Checkout/Steps/ContactInformationStep";
import {ShippingMethodStep} from "../steps/ShippingMethodStep";
import {PaymentMethodStep} from "../steps/PaymentMethodStep";
import {useLoaderData, useParams} from "react-router-dom";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {StandardFormFrame} from "@components/frames/StandardFormFrame.tsx";
import {StandardFooterNavFrame} from "@components/frames/StandardFooterNavFrame.tsx";
import {gql, useMutation, useQuery, useReadQuery} from "@apollo/client";
import {getBasename, GetCartGid} from "@lib/checkout.ts";
import {divide, get as _get, startsWith as _startsWith} from "lodash-es";

export type CheckoutFormProps = {};

const ChildrenComponents : any = {
    'information' : ContactInformationStep,
    'shipping': ShippingMethodStep,
    'payment' : PaymentMethodStep,
};
import {NavBar} from "@components/frames/StandardNavigationBarFrame.tsx";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {useSummary} from "../hooks/useSummary.ts";
import {api} from "@lib/api.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment, QueryImageFragment,
    QueryLineItemsFragment,
    QueryVariantFragment
} from "@query/checkouts/fragments/fragments.ts";
import {MutateShippingAddress} from "@query/checkouts/mutations.ts";
import {shopify_payment} from "../../lib/payment.ts";
import {useCartCache} from "@query/checkouts/cache/useCartCache.ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {CheckoutFooter} from "./CheckoutFooter.tsx";

export const CheckoutForm: FC<CheckoutFormProps> = (props) => {
    const {} = props;

    const {action = 'information',token} = useParams();

    const {json} = useSummary();
    const checkout  = getCheckoutFromSummary(json,'cart');

    const basename = getBasename();
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
