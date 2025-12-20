import {QueryDeliveryGroups} from "@query/checkouts/queries.ts";
import {QueryDeliveryGroupsFragment} from "@query/checkouts/fragments/fragments.ts";
import {gql} from "@apollo/client";

export const GetDeliveryGroupQuery = gql([
    QueryDeliveryGroups,
    QueryDeliveryGroupsFragment,
].join("\n"));
