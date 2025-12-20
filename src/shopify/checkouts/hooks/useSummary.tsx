import {NetworkStatus, useApolloClient, useQuery, useReadQuery} from "@apollo/client";
import {get as _get, has as _has, isArray as _isArray, isEmpty} from "lodash-es";

import {useRouteLoaderData} from "react-router-dom";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {CartStorage} from "../../context/CartStorage.ts";
import {createContext, FC, use, } from "react";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {ShopifyFrame} from "../../ShopifyFrame.tsx";
import {ShopifyCheckoutProvider} from "../../context/ShopifyCheckoutContext.tsx";
import Form from "rc-field-form";
import {PaymentContainer} from "../../../container/PaymentContext.tsx";
import {PayingContainer} from "@components/frames/PayingContainer.tsx";
import {GetDeliveryGroupQuery} from "../../../gql/GetDeliveryGroupQuery.ts";


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


function useDeliveryGroups(cartId: string){
    const {loading :deliveryGroupsLoading,
        refetch,
        data,error,
        networkStatus : deliveryGroupsStatus} = useQuery(GetDeliveryGroupQuery,{
        refetchWritePolicy : 'overwrite',
        variables : {
            cartId,
            withCarrierRates :true,
        }
    })
    const edges = _get(data,'cart.deliveryGroups.edges');
    const groups  = (edges || []).map((group : any) => {
        return group.node;
    });
    const query_loading = deliveryGroupsLoading || deliveryGroupsStatus !== NetworkStatus.ready;
    const methods_loading = !_has(data?.cart, 'deliveryGroups') ||
        !_isArray(data?.cart?.deliveryGroups?.edges) || (edges === undefined);
    return {
        loading : query_loading || methods_loading,
        deliveryGroups : groups,
        refetch,error,
    }
}

export const SummaryContextProvider :FC<any> = (props) => {
    const {children} = props;

    const {ref,storage} = useRouteLoaderData('checkout_container') as any;
    const {data : json ,networkStatus} = useReadQuery<any>(ref);

    const {loading : shipping_methods_loading,
        refetch : refetchDeliveryGroup,
        deliveryGroups,
    } = useDeliveryGroups(storage.gid);

    const loading = {
        shipping_methods: shipping_methods_loading,
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
            refetchDeliveryGroup,
            loading,
            groups: deliveryGroups as any[],
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
            // query: SummaryQuery,
            query : GetDeliveryGroupQuery,
            variables: vars
        })
        if(!all){
            storage.reset();
            window.location.reload();
            return;
        }
        client.writeQuery({
            // query: SummaryQuery,
            query: GetDeliveryGroupQuery,
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
