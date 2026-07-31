import {createBrowserRouter,Params, redirectDocument, RouterProvider,} from "react-router-dom";
import {api, getFinalPath} from "@lib/api.ts";
import Checkout from "./shopify/checkouts";
import {preload} from "swr";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import {getOrder} from "@lib/payment.ts";
import {get as _get, sum} from "lodash-es";
import {lazy} from "react";
import {
    PreloadCart,
} from "@lib/checkout.ts";
import {gql,} from "@apollo/client";


function preload_api(url: string) {
    return api({
        method: 'get',
        url,
    })
}

async function prefetch<T = any>(key: string) {
    // const hit = Cache.get(key)?.data;
    // if(!!hit){
    //     console.log('hit:',key,hit);
    //     return hit  as T;
    // }
    // const resource = await preload_api(key);
    // await mutate(key,resource,{
    //     populateCache : true,
    //     revalidate : false,
    // });
    // return resource;
    return preload<T>(key, preload_api)
    // return Preloader.fetch<T>(key,preload_api)
}

// import {Additional} from "./shopify/additional/Additional.tsx";
// const Additional = lazy(() => {
//     return import("./shopify/additional/Additional").then(m=>{
//         return {default : m.Additional};
//     })
// })

// const OrderPage = lazy(async() => {
//     const m = await import("./shopify/order/order.tsx");
//     return {
//         default : m.Order,
//     }
// })
const Additional = lazy(() => {
    return import("./NextPages.tsx").then((m) => {
        return {default: m.Additional};
    });
})
const OrderPage = lazy(() => {
    return import("./NextPages.tsx").then((m) => {
        return {default: m.Order};
    });
})
const prefix = getGlobalBase();

function go2home() {
    return redirectDocument('/');
}

import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {QuerySummary} from "@query/checkouts/queries.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    // QueryDeliveryGroupsFragment,
    // QueryImageFragment
} from "@query/checkouts/fragments/fragments.ts";
import {getCartGid} from "@lib/cart.ts";
import {ShopifyCheckoutFrame} from "./shopify/fragments/ShopifyCheckoutFrame.tsx";
import {getGlobalBase} from "./shopify/lib/globalSettings.ts";
import {CheckoutShell} from "./CheckoutShell.tsx";
import {getMetaContent} from "@lib/metaHelper.ts";

export const SummaryQuery = gql([
    QuerySummary,
    // QueryImageFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryBuyerIdentityFragment,
    // QueryDeliveryGroupsFragment,
].join("\n"));


function ShellLoader(request: Request, params: Params<string>){
    const url = new URL(request.url)
    const {action = 'information'} = params;
    const discount_code = url.searchParams.get('discount_code');
    if (!!discount_code) {
        Cookies.set('discount_code', discount_code, {
            expires: dayjs().add(2, 'weeks').toDate(),
        });
    }
    if (action === 'recover') {
        const key = url.searchParams.get('key') || getMetaContent('cart_key');
        if (key && key !== 'undefined') {
            Cookies.set('recovery_key', key, {
                expires: dayjs().add(1, 'day').toDate(),
            });
        }
    }
    return null;
}
async function getCheckout(params: Params<string>) {
    const {token, shop} = params;
    const key = getMetaContent('cart_key');
    if (!key) {
        return go2home();
    }
    const {ref, cart} = await PreloadCart(getCartGid(token, key));
    let checkout: any = null;
    if (cart) {
        if (_get(cart, 'data.cart.totalQuantity', 0) < 1) {
            return go2home();
        }
        checkout = getCheckoutFromSummary(cart);
    }

    if (!checkout) {
        return go2home();
    }

    return {checkout, ref, shop};
}

import.meta.env.DEV && console.log('prefix:', prefix);
function ignoreSearchChange(param : any){
    const {currentUrl, nextUrl, defaultShouldRevalidate,} = param;
    const current = new URLSearchParams(currentUrl.search);
    const next = new URLSearchParams(nextUrl.search);
    return current.toString() !== next.toString() ? defaultShouldRevalidate : false;
}
const router = createBrowserRouter([
    {
        path: `${prefix}/additional/:token`,
        id: 'additional',
        Component: Additional,
        async loader(request) {
            const {params} = request;
            const {token} = params;
            const res = await api({
                method: "get",
                url: getFinalPath(`/api/upsell/${token}`),
            });
            if (res) {
                return res;
            }
            return go2home();
        }
    }, {
        path: `${prefix}/orders/:token/:action?`,
        id: 'order',
        async loader(request) {
            const {params} = request;
            const {token, action} = params;
            return await getOrder(token!, action === 'thank-you');
        },
        Component: OrderPage,
    }, {
        path: prefix + '/',
        id: "checkout_shell",
        async loader({request, params}) {
            ShellLoader(request, params);
            return null;
        },
        Component : CheckoutShell,
        shouldRevalidate : ignoreSearchChange,
        children: [{
            id: 'checkout_container',
            shouldRevalidate : ignoreSearchChange,
            Component: ShopifyCheckoutFrame,
            async loader({params}) {
                return await getCheckout(params)
            },
            children: [
                {
                    path: `approve/:token`,
                    'id': 'approve',
                    Component: Checkout,
                }, {
                    'id': 'checkout',
                    path: 'checkouts/:token/:action?',
                    Component: Checkout,
                }
            ]
        }]
    }
], {});

export function App() {
    return <RouterProvider router={router}/>
}
