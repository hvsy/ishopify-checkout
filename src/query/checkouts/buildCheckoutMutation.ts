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
    // 只有地址/快递分支会 `cart { ...CartFields }`；cartBuyerIdentityUpdate 只返回
    // userErrors/warnings，此时再带上 CartFields 会触发 GraphQL 校验错误
    // "Fragment CartFields was defined, but not used"（Delivery/BuyerIdentity 是它的依赖，
    // 一起省略，否则同样报 unused）。SyncManager 的 identity-only 写入会走到这里。
    const usesCartFields = !!(vars.updateAddress || vars.createAddress || vars.updateSelectedDelivery);
    const fragments = usesCartFields
        ? [QueryCartFieldsFragment, QueryDeliveryFragment, QueryBuyerIdentityFragment]
        : [];
    return gql([
        `mutation Checkout(${declarations.join(',')}){\n${operations.join('\n')}\n}`,
        ...fragments,
    ].join("\n"));
}
