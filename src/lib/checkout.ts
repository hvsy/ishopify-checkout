import Cookies from "js-cookie";
import {api} from "./api.ts";
import {add, get as _get} from "lodash-es";
import {createGraphQLClient, generateGetGQLClientParams} from "@shopify/graphql-client";


export function getBasename(){
    const token = Cookies.get('cart');
    const segments = (token||'').split('?');
    return `/a/s/checkouts/${segments[0]}`;
}
const Client = createGraphQLClient({
    url : '/api/2025-07/graphql.json',
    headers : {
        'Content-Type': 'application/json',
    },
    logger(content){
        console.log('log:',content);
    },
    customFetchApi(url,options){
        console.log('fetch url:',url,options);
        return fetch(url,options);
    }
})
export async function storefront_stream(query : string,variables : any = {}){
    const stream = await Client.requestStream(query,{variables});
    for await (const res of stream){
        if(!res.hasNext){
            return {
                data : res.data,
                errors : res.errors
            }
        }
    }
}
export async function storefront(query : string,variables : any = {}){
    return api({
        url: '/api/2025-07/graphql.json',
        'method': "post",
        data : {
            query,
            variables,
        }
    });
}
import {ApolloClient, createQueryPreloader, InMemoryCache} from "@apollo/client";

export const ApolloStoreFrontClient = new ApolloClient({
    uri : '/api/2025-07/graphql.json'  ,
    cache : new InMemoryCache({
        typePolicies : {
            Cart : {
                // merge(existing,incoming,options){
                //     console.log('cart merge:',existing,incoming,options);
                // }
                // fields : {
                //     deliveryGroups : {
                //         keyArgs : false,
                //         // merge(existing,incoming){
                //         //     return incoming;
                //         // }
                //         merge(_,incoming){
                //             console.log('cart fields delivery groups',_,incoming);
                //             return incoming;
                //         },
                //     }
                // }
            },
            CartDeliveryGroup : {
                fields :{
                    deliveryOptions:{
                        keyArgs : ['handle'],
                        merge(_,incoming){
                            return incoming;
                        }
                    }
                }
            },
            CartDeliveryGroupEdge:{
                // merge(_,incoming){
                //     console.log('cart delivery group edge:',_,incoming);
                //     return incoming;
                // }
            },
            CartDeliveryAddress : {
                // merge(existing,incoming,options){
                //     // console.log(existing,incoming,options);
                //     // return options.mergeObjects(existing,incoming);
                //     return incoming;
                // }
            },
            // CartDeliveryGroup : {
            //     fields : {
            //         deliveryOptions:{
            //             keyArgs : ['handle'],
            //             merge(_,incoming){
            //                 return incoming;
            //             }
            //             // merge(existing, incoming,options) {
            //             //     console.log('delivery options:',existing,incoming,options);
            //             //     // 覆盖旧数组，只保留新 payload
            //             //     return incoming;
            //             // },
            //         }
            //     },
            // },
            CartDeliveryOption : {
                keyFields : ['handle'],
            //     // merge(existing,incoming,options) {
            //     //     if(existing){
            //     //         return existing;
            //     //     }else{
            //     //         return options.mergeObjects(existing,incoming);
            //     //     }
            //     //     // console.log('cart delivery options:',existing,incoming,options);
            //     //     // return incoming;
            //     // }
            }

        }
    }),
});
export const ApolloPreloader = createQueryPreloader(ApolloStoreFrontClient);




export function GetCartGid(){
    const token = Cookies.get('cart');
    return `gid://shopify/Cart/${token}`;
}

export function transform_address(data : any,prefix : string = "data.cart"){
    const delivery = _get(data, `${prefix}.delivery.addresses.0`, {})
    const address = delivery?.address || {};
    const areas = Array.from(address.formatted || []).reverse();
    return {
        shipping_address_id: delivery.id === 'gid://shopify/CartSelectableAddress/0' ? null : delivery.id,
        shipping_address: {
            first_name: address.firstName,
            last_name: address.lastName,
            city: address.city,
            region: areas[0] ? {
                en_name: areas[0],
            } : null,
            state: areas.length > 4 ? {
                en_name: areas[1],
            } : null,
            region_code: address.countryCode,
            state_code: address.provinceCode,
            line1: address.address1,
            line2: address.address2,
            zip: address.zip,
            phone: address.phone,
        }
    }
}





const Maps : any = {
    'line2': 'address2',
    'line1' : 'address1',
    'region.en_name' : 'country',
    'state.en_name' : 'province',
    'zip' : 'zip',
    'first_name' : 'firstName',
    'last_name' : 'lastName',
    'phone' : 'phone',
    'city' : 'city',
};
export function getShippingRateUrl(address ?: DB.Address){
    if(!address) return null;
    const qs : string[] = [];
    Object.keys(Maps).map((from) => {
        const to = _get(address,from,null);
        const key = Maps[from];
        if(!!to){
            qs.push(`shipping_address[${key}]=${to}`);
        }
    });
    if(qs.length === 0) return null;
    return `/cart/prepare_shipping_rates.json?${qs.join('&')}`;
}
