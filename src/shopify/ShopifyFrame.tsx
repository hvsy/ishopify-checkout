import {FC, ReactNode} from "react";
import {gql, useQuery, useReadQuery} from "@apollo/client";
import {capitalize as _capitalize, template as _tpl} from "lodash-es";
import {ShopifyContext} from "./context/ShopifyContext.ts";

import {useLoaderData, useParams, useRouteLoaderData} from "react-router-dom";
import {ShopifyDiscountCodeProvider} from "./context/ShopifyDiscountCodeContext.tsx";

export type ShopifyFrameProps = {
    children?: ReactNode;
};
import {get as _get} from "lodash-es";
import {PaymentContainer,} from "../container/PaymentContext.tsx";
import {useDocumentTitle} from "usehooks-ts";

export const ShopifyFrame: FC<ShopifyFrameProps> = (props) => {
    const {children} = props;
    const {ref} = useRouteLoaderData('checkout') as any;
    const data = useReadQuery(ref) as any;
    const codes = (_get(data, 'data.cart.discountCodes', []) || []).filter((c: any) => !!c.applicable).map((c: any) => c.code);
    const {action = 'information'} = useParams();
    const shop = data?.data?.shop;
    // useDocumentTitle(shop ? _capitalize(action) + ' - ' +  shop.name  : '',{
    //
    // });
    useDocumentTitle(shop ? shop.name + '-Checkout' : '');

    return <ShopifyContext value={{
            shop: !!shop ? {
                ...shop,
                format: _tpl(shop.moneyFormat, {
                    interpolate: /{{([\s\S]+?)}}/g,
                })
            } : {},
        }}>
            <ShopifyDiscountCodeProvider codes={codes}>

                {children}
            </ShopifyDiscountCodeProvider>
        </ShopifyContext>
};
