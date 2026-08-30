import {createBrowserRouter,Params, redirectDocument, RouterProvider,} from "react-router-dom";
import {api, getFinalPath} from "@lib/api.ts";
import Checkout from "./shopify/checkouts";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import {getOrder} from "@lib/payment.ts";
import {lazy} from "react";


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
// }
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

import {ShopifyCheckoutFrame} from "./shopify/fragments/ShopifyCheckoutFrame.tsx";
import {getGlobalBase} from "./shopify/lib/globalSettings.ts";
import {CheckoutShell} from "./CheckoutShell.tsx";
import {getMetaContent} from "@lib/metaHelper.ts";

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
    const {shop} = params;
    const key = getMetaContent('cart_key');
    if (!key) {
        return go2home();
    }
    return {shop};
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
