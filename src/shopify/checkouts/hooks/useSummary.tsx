import {NetworkStatus, useApolloClient, useQuery} from "@apollo/client";
import {get as _get, has as _has, isArray as _isArray, isEmpty} from "lodash-es";

import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {useCart} from "@hooks/useCart.ts";
import {createContext, FC, useEffect, use, } from "react";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {ShopifyFrame} from "../../ShopifyFrame.tsx";
import {ShopifyCheckoutProvider} from "../../context/ShopifyCheckoutContext.tsx";
import Form from "@rc-component/form";
import {PaymentContainer} from "../../../container/PaymentContext.tsx";
import {PayingContainer} from "@components/frames/PayingContainer.tsx";
import {GetDeliveryGroupQuery} from "../../../gql/GetDeliveryGroupQuery.ts";
import {SummaryQuery} from "@query/checkouts/summary.ts";
import {Features} from "@lib/flags.ts";


export const SummaryContext = createContext<{
    ing : boolean,
    checkout : ()=>any;
    loading : {
        shipping_methods : boolean,
        summary : boolean,
    },
    refetchDeliveryGroup ?: (vars ?: any)=>Promise<any>;
    groups ?: any[],
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
    const {gid} = useCart();
    const {data : json ,networkStatus,error} = useQuery(SummaryQuery, {
        variables : {
            cartId : gid,
            withCarrierRates : true,
        },
    });

    useEffect(() => {
        if (!error && !(json && (!json.cart || json.cart.totalQuantity < 1))) return;
        window.location.replace('/');
    }, [json, error]);

    const {loading : shipping_methods_loading,
        refetch : refetchDeliveryGroup,
        deliveryGroups,
    } = useDeliveryGroups(gid);

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
        }}>
            <ShopifyCheckoutProvider form={form}>
                <FormContainer form={form} initialValues={loading.summary ? null : checkout}>
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
    const {gid} = useCart();
    return (groups: (any[])|null) => {
        const vars = {
            cartId: gid, withCarrierRates: true,
        };
        const all = client.readQuery({
            // query: SummaryQuery,
            query : GetDeliveryGroupQuery,
            variables: vars
        })

        if(!all && Features.includes('empty_delivery_redirect')){
            window.location.reload();
            return;
        }
        if(!!all){
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
}
