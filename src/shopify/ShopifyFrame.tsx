import {FC, ReactNode} from "react";
import {template as _tpl} from "lodash-es";
import {ShopifyContext} from "./context/ShopifyContext.ts";

import {ShopifyDiscountCodeProvider} from "./context/ShopifyDiscountCodeContext.tsx";

export type ShopifyFrameProps = {
    children?: ReactNode;
};
import {get as _get} from "lodash-es";
import {useDocumentTitle} from "usehooks-ts";
import {useCurrentReadQuery} from "./checkouts/hooks/useCurrentLoaderData.tsx";

export const ShopifyFrame: FC<ShopifyFrameProps> = (props) => {
    const {children} = props;
    const data = useCurrentReadQuery();
    const codes = (_get(data, 'data.cart.discountCodes', []) || []).filter((c: any) => !!c.applicable).map((c: any) => c.code);
    const shop = data?.data?.shop;
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
