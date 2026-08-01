import {gql} from "@apollo/client";
import type {DocumentNode} from "graphql";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
} from "./fragments/fragments.ts";

/**
 * 按需组装 checkout mutation：$addressId / $deliveryGroupId 只在对应的
 * 字段真正执行时才声明，避免创建地址时传入非法占位 ID，也避免可空变量
 * 传给非空参数导致的 nullability mismatch。
 */
export function buildCheckoutMutation(vars: Record<string, unknown>): DocumentNode {
    const declarations: string[] = ['$cartId : ID!'];
    const operations: string[] = [];
    if (vars.updateAddress || vars.createAddress) {
        declarations.push('$validationStrategy : DeliveryAddressValidationStrategy = COUNTRY_CODE_ONLY');
    }
    if (vars.updateBuyer) {
        declarations.push('$buyerIdentity : CartBuyerIdentityInput!');
        operations.push(`cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity){
            userErrors {
                code
                field
                message
            }
            warnings {
                code
                message
                target
            }
        }`);
    }
    if (vars.updateAddress) {
        declarations.push('$delivery : CartDeliveryAddressInput!', '$addressId : ID!');
        operations.push(`cartDeliveryAddressesUpdate(cartId: $cartId, addresses: [{
            id: $addressId
            selected: true
            address: {
                deliveryAddress: $delivery
            }
            validationStrategy: $validationStrategy
        }]){
            cart {
                ...CartFields
            }
            userErrors {
                code
                field
                message
            }
            warnings {
                code
                message
                target
            }
        }`);
    }
    if (vars.createAddress) {
        declarations.push('$delivery : CartDeliveryAddressInput!');
        operations.push(`cartDeliveryAddressesAdd(cartId: $cartId, addresses: [{
            selected: true
            address: {
                deliveryAddress: $delivery
            }
            validationStrategy: $validationStrategy
        }]){
            cart {
                ...CartFields
            }
            userErrors {
                code
                field
                message
            }
            warnings {
                code
                message
                target
            }
        }`);
    }
    if (vars.updateSelectedDelivery) {
        declarations.push('$deliveryGroupId : ID!', '$deliveryOptionHandle : String!');
        operations.push(`cartSelectedDeliveryOptionsUpdate(cartId: $cartId, selectedDeliveryOptions: {
            deliveryGroupId: $deliveryGroupId,
            deliveryOptionHandle: $deliveryOptionHandle,
        }){
            cart {
                ...CartFields
            }
            userErrors {
                code
                field
                message
            }
            warnings {
                code
                message
                target
            }
        }`);
    }
    if (operations.length === 0) {
        return gql(`mutation Checkout { __typename }`);
    }
    return gql([
        `mutation Checkout(${declarations.join(',')}){\n${operations.join('\n')}\n}`,
        QueryCartFieldsFragment,
        QueryDeliveryFragment,
        QueryBuyerIdentityFragment,
    ].join("\n"));
}
