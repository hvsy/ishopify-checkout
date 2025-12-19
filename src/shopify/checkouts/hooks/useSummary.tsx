import {gql, NetworkStatus, useApolloClient, useQuery, useReadQuery} from "@apollo/client";
import {get as _get, has as _has, isArray as _isArray} from "lodash-es";

import {useRouteLoaderData} from "react-router-dom";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {SummaryQuery} from "../../../App.tsx";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {CartStorage} from "../../context/CartStorage.ts";
import {createContext, FC, use, useState} from "react";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {ShopifyFrame} from "../../ShopifyFrame.tsx";
import {ShopifyCheckoutProvider} from "../../context/ShopifyCheckoutContext.tsx";
import Form from "rc-field-form";
import {PaymentContainer} from "../../../container/PaymentContext.tsx";
import {PayingContainer} from "@components/frames/PayingContainer.tsx";
import {QueryDeliveryGroups} from "@query/checkouts/queries.ts";
import {QueryDeliveryGroupsFragment} from "@query/checkouts/fragments/fragments.ts";


export const SummaryContext = createContext<{
    ing : boolean,
    checkout : ()=>any;
    loading : {
        shipping_methods : boolean,
        summary : boolean,
    },
    refetchDeliveryGroup ?: (vars ?: any)=>Promise<any>;
    groups ?: any[],
    storage ?: CartStorage,
    json : any,
}>({
    checkout(){ return {}},
    json : {},
    ing : false,
    loading : {
        shipping_methods : false,
        summary : false,
    },
});



export const SummaryContextProvider :FC<any> = (props) => {
    const {children} = props;


    //
    const {ref,storage} = useRouteLoaderData('checkout') as any;
    const {data : json ,error,networkStatus} = useReadQuery<any>(ref);


    const {loading :deliveryGroupsLoading,
        refetch : deliveryGroupRefetch,
        data,error : deliveryGroupError,
        networkStatus : deliveryGroupsStatus} = useQuery(gql([
        QueryDeliveryGroups,
        QueryDeliveryGroupsFragment,
    ].join("\n")),{
        refetchWritePolicy : 'overwrite',
        variables : {
            cartId : storage.gid,
        }
    })
    const edges = _get(data,'cart.deliveryGroups.edges');
    const groups  = (edges || []).map((group : any) => {
        return group.node;
    });
    const query_loading = deliveryGroupsLoading || deliveryGroupsStatus !== NetworkStatus.ready;
    const methods_loading = !_has(data?.cart, 'deliveryGroups') ||
        !_isArray(data?.cart?.deliveryGroups?.edges) || (edges === undefined);

    // console.log('[delivery] groups:',edges);
    const loading = {
        shipping_methods: query_loading || methods_loading,
        summary : [NetworkStatus.loading,
            NetworkStatus.refetch,
            NetworkStatus.fetchMore,
            NetworkStatus.poll,
            NetworkStatus.setVariables,
        ].includes(networkStatus)
    }
    const ing = loading.shipping_methods || loading.summary;
    const checkout = getCheckoutFromSummary(json, 'cart');
    const [form] = Form.useForm();
    // console.log('form init:',checkout);
    return <SummaryContext value={{
            json,
            checkout() {
                // return checkout;
                return getCheckoutFromSummary(json, 'cart');
            },
            ing,
            refetchDeliveryGroup : deliveryGroupRefetch,
            loading,
            groups: groups as any[],
            storage: storage as CartStorage,
        }}>
            <ShopifyCheckoutProvider form={form}>
                <FormContainer form={form} initialValues={checkout}>
                    <ShopifyFrame>
                        {children}
                        {/*<Main/>*/}
                    </ShopifyFrame>
                </FormContainer>
            </ShopifyCheckoutProvider>
        </SummaryContext>
};
export const GlobalContextProvider : FC<any> = (props : any) => {
    const {children} = props;
    return <PayingContainer>
        <PaymentContainer>
                <SummaryContextProvider>
                    {children}
                </SummaryContextProvider>
        </PaymentContainer>
    </PayingContainer>
};
export function useSummary(){
    return use(SummaryContext);
}

export function useDeliveryGroupMutation() {
    const client = useApolloClient();
    const storage = useCartStorage();
    return (groups: (any[])|null) => {
        const vars = {
            cartId: storage.gid, withCarrierRates: true,
        };
        const all = client.readQuery({
            query: SummaryQuery,
            variables: vars
        })
        if(!all){
            storage.reset();
            window.location.reload();
            return;
        }
        client.writeQuery({
            query: SummaryQuery,
            variables: vars,
            data: {
                ...all,
                cart: {
                    ...all.cart,
                    deliveryGroups: groups,
                }
            },
        })
    }
}
