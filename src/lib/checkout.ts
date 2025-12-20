import {get as _get} from "lodash-es";
import {ApolloClient, createQueryPreloader, from, HttpLink, InMemoryCache} from "@apollo/client";
import {getMetaContent} from "./metaHelper.ts";
import {onError} from "@apollo/client/link/error";
import {RetryLink} from "@apollo/client/link/retry";
import MutationQueueLink from "@adobe/apollo-link-mutation-queue";

const api_version = getMetaContent('api_version');
const storefront_url = api_version ? `/api/${api_version}/graphql.json` :"/api/2025-10/graphql.json";

const httpLink = new HttpLink({
    uri:storefront_url
})
const errorLink = onError(({ graphQLErrors,protocolErrors, networkError ,operation}) => {
    console.error('error:',operation);
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path, }) =>
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations?.map((location) => {
                    return `@${location.line}:${location.column}`;
                }).join("\n")}, Path: ${path}`,
            ),
        );
    if (protocolErrors) {
        protocolErrors.forEach(({ message, extensions }) => {
            console.error(
                `[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`
            );
        });
    }
    if (networkError) console.error(`[Network error]: ${networkError.message} ${networkError.name}`);
});
const retryLink = new RetryLink();
const queueLink = new MutationQueueLink({debug : false});
export const ApolloStoreFrontClient = new ApolloClient({
    // uri : storefront_url,
    //@ts-ignore
    link : from([errorLink,retryLink,queueLink,httpLink]),
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
