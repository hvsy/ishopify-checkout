import {gql} from "@apollo/client";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment, QueryDeliveryFragment, QueryDeliveryGroupsFragment,
    QueryImageFragment,
    QueryLineItemsFragment,
    QueryVariantFragment
} from "../fragments/fragments.ts";

export const CacheCartQuery =  gql(([
    QueryCartFieldsFragment,
    `query CartCache($cartId : ID!,$first : Int!,$withCarrierRates : Boolean,$cursor : String){
                                cart(id : $cartId){
                                    ...CartFields
                                    ...LineItems
                                    ...DeliveryGroups
                                }
                        }`,
    QueryLineItemsFragment,
    QueryVariantFragment,
    QueryImageFragment,
    QueryDeliveryFragment,
    QueryBuyerIdentityFragment,
    QueryDeliveryGroupsFragment,
].join("\n")));
