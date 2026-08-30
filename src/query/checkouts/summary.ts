import {gql} from "@apollo/client";
import {QuerySummary} from "./queries.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartDiscountAllocationFieldsFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryDiscountsFragment,
} from "./fragments/fragments.ts";

export const SummaryQuery = gql([
    QuerySummary,
    QueryCartFieldsFragment,
    QueryDiscountsFragment,
    QueryCartDiscountAllocationFieldsFragment,
    QueryDeliveryFragment,
    QueryBuyerIdentityFragment,
].join("\n"));
