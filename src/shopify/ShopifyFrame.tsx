import {FC, ReactNode} from "react";
// import {template as _tpl} from "lodash-es";
// import {ShopifyContext} from "./context/ShopifyContext.ts";

import {ShopifyDiscountCodeProvider} from "./context/ShopifyDiscountCodeContext.tsx";

export type ShopifyFrameProps = {
    children?: ReactNode;
};
import {get as _get} from "lodash-es";
import {useDocumentTitle} from "usehooks-ts";
import {useSummary} from "./checkouts/hooks/useSummary.tsx";
import {getMetaContent} from "@lib/metaHelper.ts";

export const ShopifyFrame: FC<ShopifyFrameProps> = (props) => {
    const {children} = props;
    const {json} = useSummary();
    const codes = (_get(json, 'cart.discountCodes', []) || []).filter((c: any) => !!c.applicable).map((c: any) => c.code);
    const shopTitle = getMetaContent('shop_title');
    useDocumentTitle(shopTitle ? shopTitle + '-Checkout' : '');

    // return <ShopifyContext value={{
    //         shop: !!shop ? {
    //             ...shop,
    //             format: _tpl(shop.moneyFormat, {
    //                 interpolate: /{{([\s\S]+?)}}/g,
    //             })
    //         } : {},
    //     }}>
            return <ShopifyDiscountCodeProvider codes={codes}>
                {children}
            </ShopifyDiscountCodeProvider>
        // </ShopifyContext>
};
