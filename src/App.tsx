import {createBrowserRouter, redirect, RouterProvider,} from "react-router-dom";
import {api} from "@lib/api.ts";
import Checkout from "./shopify/checkouts/index.tsx";
import {preload} from "swr";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import {getOrder} from "@lib/payment.ts";
import {lazy} from "react";
import {
    ApolloPreloader,
    GetCartGid,
} from "@lib/checkout.ts";
import {MethodValidators} from "@lib/MethodValidators.ts";
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
    // return redirectDocument('/');
}


import {unwrapQueryRef} from "@apollo/client/react/internal";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {QuerySummary} from "@query/checkouts/queries.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryImageFragment
} from "@query/checkouts/fragments/fragments.ts";
import {CartStorage} from "./shopify/context/CartStorage.ts";
let router = createBrowserRouter([
    {
        path: `${prefix}/orders/:token/:action?`,
        async loader(request) {
            const {params} = request;
            const {token,action}  = params;
            return await getOrder(token!,action === 'thank-you');
        },
        Component: OrderPage,
    }, {
        path: `${prefix}/checkouts/:token/:action?`,
        async loader({request,params,context}) {
            const url = new URL(request.url)
            const key = url.searchParams.get('key');
            let {token, action = 'information'} = params;
            const storage = new CartStorage(token!);
            if(action === 'recover' && !!key){
                storage.key = key;
            }
            const discount_code = url.searchParams.get('discount_code');
            if(!!discount_code){
                Cookies.set('discount_code',discount_code,{
                    expires : dayjs().add(2,'weeks').toDate(),
                });
            }
            let ref = null;
            const cart = await new Promise((resolve,reject) => {
                ref = ApolloPreloader(gql([
                    QuerySummary,
                    QueryImageFragment,
                    QueryCartFieldsFragment,
                    QueryDeliveryFragment,
                    QueryBuyerIdentityFragment,
                ].join("\n")),{
                    variables : {
                        cartId : storage.gid,
                    }
                });
                ref.toPromise().then((result) => {
                    const unwrap = unwrapQueryRef(result);
                    // console.log('then:',result,unwrap?.promise);
                    resolve(unwrap?.promise);
                    return result;
                }, (error) => {
                    console.error('error:',error);
                    reject(error);
                })
            });
            let checkout : any = null;
            if(cart){
                checkout = getCheckoutFromSummary(cart);
                console.log('preload cart:',cart,checkout);
            }

            if(!checkout){
                return go2home();
            }
            if(action === 'recover' && !!key){
                Cookies.set('recovery_key', key,{
                    expires : dayjs().add(1,'day').toDate(),
                });
                if(checkout?.shop?.preference?.checkout?.page_style !== 'single'){
                    const steps = Object.keys(MethodValidators);
                    let next = "information"
                    for(let i=0; i < steps.length; i++){
                        const step = steps[i] as any;
                        if(!!MethodValidators[step]?.validator(checkout)){
                            next = step;
                        }
                    }
                    return redirect(`/a/s/checkouts/${token}/${next}`);
                }
                return {checkout,ref,storage};
            }else{
                const method = MethodValidators[action];
                if(method){
                    if(!method.validator(checkout)){
                        return redirect(`/a/s/checkouts/${token}/${method.prev}`);
                    }
                }
                return {checkout,ref,storage};
            }


            // const api_url = `/checkouts/${token}`;
            // // await prefetch(`/zones`);
            // // const checkout = await prefetch<DB.Checkout>(api_url);
            // const checkout = await prefetch_checkout<DB.Checkout>(api_url);
            // console.log('checkout:',checkout);

        },
        Component: Checkout,
    }
], {
});

export function App() {
    return <RouterProvider router={router}/>
}
