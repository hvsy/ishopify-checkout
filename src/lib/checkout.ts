import {get as _get} from "lodash-es";


const storefront_url = "/api/2025-10/graphql.json";
import {ApolloClient, createQueryPreloader, InMemoryCache} from "@apollo/client";

export const ApolloStoreFrontClient = new ApolloClient({
    uri : storefront_url,
    cache : new InMemoryCache({
        typePolicies : {
            Cart : {},
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

            CartDeliveryOption : {
                keyFields : ['handle'],
            }

        }
    }),
});
export const ApolloPreloader = createQueryPreloader(ApolloStoreFrontClient);



export function transform_address(data : any,prefix : string = "data.cart"){
    const delivery = _get(data, `${prefix}.delivery.addresses.0`, {})
    const address = delivery?.address || {};
    const areas = Array.from(address.formatted || []).reverse();
    const id = delivery.id === 'gid://shopify/CartSelectableAddress/0' ? null : delivery.id;
    return {
        shipping_address_id: id,
        shipping_address: {
            id,
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
            phone: address.phone || '',
        }
    }
}
