import {createContext, FC, use} from "react";
import {gql, NetworkStatus, useQuery} from "@apollo/client";
import {GetCartGid} from "@lib/checkout.ts";
import {get as _get, has as _has, isArray as _isArray} from "lodash-es";
import {QueryShippingMethods} from "@query/checkouts/queries.ts";
import {QueryDeliveryGroupsFragment} from "@query/checkouts/fragments/fragments.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";

export const DeliveryGroupContext = createContext<{loading : boolean,
    groups : any[],
    changing : boolean,
}>({
    loading : false,
    changing : false,
    groups : [],
});


export const DeliveryGroupProvider : FC<any> = (props) => {
    const {children,countryCode} = props;
    const storage = useCartStorage();
    const {data,loading,networkStatus} = useQuery(gql([
        QueryShippingMethods,
        QueryDeliveryGroupsFragment,
    ].join("\n")),{
        notifyOnNetworkStatusChange : true,
        // nextFetchPolicy : 'network-only',
        refetchWritePolicy : 'overwrite',
        'fetchPolicy' : 'network-only',
        // 'initialFetchPolicy' : 'network-only',
        variables : {
            countryCode,
            withCarrierRates : true,
            cartId : storage.gid,
        }
    });
    const groups  =_get(data,'cart.deliveryGroups.edges',[]).map((group : any) => {
        return group.node;
    });
    return <DeliveryGroupContext value={{
        loading : !_has(data?.cart,'deliveryGroups') || !_isArray(data?.cart?.deliveryGroups?.edges),
        changing : [NetworkStatus.loading,
            NetworkStatus.refetch,
            NetworkStatus.fetchMore,
        ].includes(networkStatus)|| loading,
        groups :  groups,
    }}>
        {children}
    </DeliveryGroupContext>
};

export function useDeliveryGroups(){
    return use(DeliveryGroupContext);
}
