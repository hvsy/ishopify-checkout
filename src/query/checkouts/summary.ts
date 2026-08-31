import {gql} from "@apollo/client";
import {QuerySummary} from "./queries.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartDiscountAllocationFieldsFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryDeliveryGroupsFragment,
    QueryImageFragment,
    QueryLineItemsFragment,
    QueryVariantFragment,
} from "./fragments/fragments.ts";

export const SummaryQuery = gql([
    QuerySummary,
    QueryCartFieldsFragment,
    QueryCartDiscountAllocationFieldsFragment,
    QueryDeliveryFragment,
    QueryBuyerIdentityFragment,
    QueryLineItemsFragment,
    QueryVariantFragment,
    QueryImageFragment,
    QueryDeliveryGroupsFragment,
].join("\n"));
