import {NetworkStatus, useApolloClient, useReadQuery} from "@apollo/client";
import {get as _get, has as _has, isArray as _isArray, set as _set} from "lodash-es";

import {Outlet, useLoaderData, useRouteLoaderData} from "react-router-dom";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {SummaryQuery} from "../../../App.tsx";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {CartStorage} from "../../context/CartStorage.ts";
import {createContext, FC, use, useState} from "react";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {ShopifyFrame} from "../../ShopifyFrame.tsx";
import {ShopifyCheckoutProvider} from "../../context/ShopifyCheckoutContext.tsx";
import Form from "rc-field-form";
import {PaymentContainer, PaymentContext} from "../../../container/PaymentContext.tsx";
import {PayingContainer} from "@components/frames/PayingContainer.tsx";



export const SummaryContext = createContext<{
    setSelectedDeliveryStatus ?: (status : boolean)=>void,
    ing : boolean,
    checkout : ()=>any;
    loading : {
        shipping_methods : boolean,
        summary : boolean,
        updatingSelectedDelivery : boolean,
    },
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
        updatingSelectedDelivery : false,
    },
});

export const SummaryContextProvider :FC<any> = (props) => {
    const {children} = props;
    const [updatingSelectedDelivery,setSelectedDeliveryStatus] = useState<boolean>(false);
    const {ref,storage} = useRouteLoaderData('checkout') as any;
    const {data : json ,error,networkStatus} = useReadQuery<any>(ref);
    const groups  =_get(json,'cart.deliveryGroups.edges',[]).map((group : any) => {
        return group.node;
    });
    const loading = {
        updatingSelectedDelivery,
        shipping_methods: !_has(json?.cart, 'deliveryGroups') ||
            !_isArray(json?.cart?.deliveryGroups?.edges),
        summary : [NetworkStatus.loading,
            NetworkStatus.refetch,
            NetworkStatus.fetchMore,
            NetworkStatus.poll,
        ].includes(networkStatus)
    }
    const ing = loading.shipping_methods || loading.summary || loading.updatingSelectedDelivery;
    const checkout = getCheckoutFromSummary(json, 'cart');
    const [form] = Form.useForm();
    console.log('form init:',checkout);
    return <SummaryContext value={{
            json,
            checkout() {
                // return checkout;
                return getCheckoutFromSummary(json, 'cart');
            },
            ing,
            setSelectedDeliveryStatus,
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
