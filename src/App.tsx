import {createBrowserRouter, Params, redirect, redirectDocument, RouterProvider,} from "react-router-dom";
import {api} from "@lib/api.ts";
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


function preload_api(url : string){
    return api({
        method : 'get',
        url,
    })
}

async function prefetch<T = any>(key : string){
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
    return preload<T>(key,preload_api)
    // return Preloader.fetch<T>(key,preload_api)
}
const OrderPage = lazy(async() => {
    const m = await import("./shopify/order");
    return {
        default : m.Order,
    }
})
const prefix = '/a/s'
function go2home(){
    return redirectDocument('/');
}


import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {QuerySummary} from "@query/checkouts/queries.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment, QueryDeliveryGroupsFragment,
    QueryImageFragment
} from "@query/checkouts/fragments/fragments.ts";
import {CartStorage} from "./shopify/context/CartStorage.ts";
import {ShopifyCheckoutFrame} from "./shopify/fragments/ShopifyCheckoutFrame.tsx";
import {Additional} from "./shopify/additional/Additional.tsx";
export const SummaryQuery = gql([
    QuerySummary,
    QueryImageFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryBuyerIdentityFragment,
    // QueryDeliveryGroupsFragment,
].join("\n"));


async function getCheckout(request : Request,params : Params<string>,context : any){
    const url = new URL(request.url)
    const key = url.searchParams.get('key');
    let {token, action = 'information'} = params;
    // console.log('params:',params);
    const storage = new CartStorage(token!);
    if(action === 'recover' && !!key && key !== 'undefined'){
        storage.key = key;
    }else{
        const direct = url.searchParams.get('direct');
        if(!!direct && direct !== 'undefined'){
        // if(!!direct){
            storage.key = direct;
            return redirect(`/a/s/checkouts/${token}`);
        }
    }
    if(!storage.key){
        const res =  await api({
            method : "post",
            url : `/a/s/checkouts/${token}/key`,
        });
        if(!res){
            return go2home();
        }
        storage.key = res;
    }
    const discount_code = url.searchParams.get('discount_code');
    if(!!discount_code){
        Cookies.set('discount_code',discount_code,{
            expires : dayjs().add(2,'weeks').toDate(),
        });
    }
    let {ref,cart} = await PreloadCart(storage.gid);
    let checkout : any = null;
    if(cart){
        if(_get(cart,'data.cart.totalQuantity',0) < 1){
            return go2home();
        }
        checkout = getCheckoutFromSummary(cart);
    }

    if(!checkout){
        return go2home();
    }
    if(action === 'recover' && !!key){
        Cookies.set('recovery_key', key,{
            expires : dayjs().add(1,'day').toDate(),
        });
    }
    return {checkout,ref,storage};
}

let router = createBrowserRouter([
    {
        path : `${prefix}/additional/:token`,
        id : 'additional',
        Component : Additional,
        async loader(request){
            const {params} = request;
            const {token} = params;
            const res = await api({
                method : "get",
                url : `/a/s/api/upsell/${token}`,
            });
            if(res){
               return res;
            }
            return go2home();
        }
    },{
        path: `${prefix}/orders/:token/:action?`,
        id : 'order',
        async loader(request) {
            const {params} = request;
            const {token,action}  = params;
            return await getOrder(token!,action === 'thank-you');
        },
        Component: OrderPage,
    },{
        path : prefix + '/',
        id : 'checkout_container',
        Component : ShopifyCheckoutFrame,
        async loader({request,params,context}) {
            return await getCheckout(request,params,context)
        },
        children : [
            {
                path : `approve/:token`,
                'id' : 'approve',
                Component : Checkout,
            },{
                'id' : 'checkout',
                path : 'checkouts/:token/:action?',
                Component: Checkout,
            }
        ]
    },
], {
});

export function App() {
    return <RouterProvider router={router}/>
}
