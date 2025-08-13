import {FC, ReactNode} from "react";
import {gql, useQuery, useReadQuery} from "@apollo/client";
import {capitalize as _capitalize, template as _tpl} from "lodash-es";
import {ShopifyContext} from "./context/ShopifyContext.ts";

import {useLoaderData, useParams} from "react-router-dom";
import { ShopifyDiscountCodeProvider } from "./context/ShopifyDiscountCodeContext.tsx";
export type ShopifyFrameProps = {
    children ?: ReactNode;
};
import {get as _get} from "lodash-es";
import {PaymentContainer, PaymentContext} from "../container/PaymentContext.tsx";
import {DeliveryGroupProvider} from "./context/DeliveryGroupContext.tsx";
import {useDocumentTitle} from "usehooks-ts";

export const ShopifyFrame: FC<ShopifyFrameProps> = (props) => {
    const {children} = props;
    const {ref} =useLoaderData() as any;
    const data = useReadQuery(ref) as any;
    // const {data,loading} = useQuery(gql([
    //     ShopQuery,
    //     ImageQuery
    // ].join("\n")),{
    //
    // });
    const codes = _get(data,'data.cart.discountCodes').filter((c:any)=>!!c.applicable).map((c:any)=>c.code);
    const countryCode = _get(data,'data.cart.delivery.addresses.0.address.countryCode',null);
    const {action = 'information'}  = useParams();
    const shop  = data?.data?.shop;
    useDocumentTitle(shop ? _capitalize(action) + ' - ' +  shop.name  : '',{

    });

    return <ShopifyContext value={{
        shop: !!shop ? {
            ...shop,
            format : _tpl(shop.moneyFormat,{
                interpolate : /{{([\s\S]+?)}}/g,
            })
        } : {

        },
    }}>
        <ShopifyDiscountCodeProvider codes={codes}>
            <DeliveryGroupProvider countryCode={countryCode} key={countryCode}>
                <PaymentContainer>
                    {children}
                </PaymentContainer>
            </DeliveryGroupProvider>
        </ShopifyDiscountCodeProvider>
    </ShopifyContext>;
};
