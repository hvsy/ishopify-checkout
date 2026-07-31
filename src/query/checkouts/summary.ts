import {gql} from "@apollo/client";
import {QuerySummary} from "./queries.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
} from "./fragments/fragments.ts";

export const SummaryQuery = gql([
    QuerySummary,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryBuyerIdentityFragment,
].join("\n"));
