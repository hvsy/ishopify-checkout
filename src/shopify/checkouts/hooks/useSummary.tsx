import {NetworkStatus, useApolloClient, useQuery} from "@apollo/client";
import {get as _get, has as _has, isArray as _isArray} from "lodash-es";

import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {useCart} from "@hooks/useCart.ts";
import {createContext, FC, useEffect, use, } from "react";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {ShopifyCheckoutProvider} from "../../context/ShopifyCheckoutContext.tsx";
import Form from "@rc-component/form";
import {PaymentContainer} from "../../../container/PaymentContext.tsx";
import {PayingContainer} from "@components/frames/PayingContainer.tsx";
import {GetDeliveryGroupQuery} from "../../../gql/GetDeliveryGroupQuery.ts";
import {SummaryQuery} from "@query/checkouts/summary.ts";
import {Features} from "@lib/flags.ts";
import {getMetaContent} from "@lib/metaHelper.ts";
import {useDocumentTitle} from "usehooks-ts";


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


export function getDeliveryGroupsFromJson(json : any){
    const edges = _get(json,'cart.deliveryGroups.edges');
    return (edges || []).map((group : any) => {
        return group.node;
    });
}

export const SummaryContextProvider :FC<any> = (props) => {
    const {children} = props;
    const {gid} = useCart();
    // 单个 CheckoutQuery 一次取回 Summary/行项目/快递分组，避免进入结算页后
    // 并发发出 Summary + GetDeliveryGroups + CartLineItems 三个 GraphQL 请求。
    const {data : json ,networkStatus,error,refetch} = useQuery(SummaryQuery, {
        variables : {
            cartId : gid,
            first : 10,
            withCarrierRates : true,
        },
    });
    const shopTitle = getMetaContent('shop_title');
    useDocumentTitle(shopTitle ? shopTitle + '-Checkout' : '');

    useEffect(() => {
        if (!error && !(json && (!json.cart || json.cart.totalQuantity < 1))) return;
        window.location.replace('/');
    }, [json, error]);

    const deliveryGroups = getDeliveryGroupsFromJson(json);
    const groupsEdges = _get(json,'cart.deliveryGroups.edges');
    const methods_loading = !_has(json?.cart, 'deliveryGroups') ||
        !_isArray(groupsEdges) || (groupsEdges === undefined);
    const shipping_methods_loading = methods_loading || networkStatus !== NetworkStatus.ready;

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
    return <SummaryContext value={{
            json,
            checkout() {
                return getCheckoutFromSummary(json, 'cart');
            },
            ing,
            refetchDeliveryGroup: refetch,
            loading,
            groups: deliveryGroups as any[],
        }}>
            <ShopifyCheckoutProvider form={form}>
                <FormContainer form={form}
                               initialValues={loading.summary ? null : checkout}>
                        {children}
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
        let all;
        try {
            all = client.readQuery({
                query : GetDeliveryGroupQuery,
                variables: vars
            });
        } catch {
            // 缓存里还没有该查询（例如首次切换国家时尚未加载完成），忽略即可，
            // 后续 mutation 的 refetch 会重新拉取最新数据。
            all = null;
        }

        if(!all && Features.includes('empty_delivery_redirect')){
            window.location.reload();
            return;
        }
        if(!!all){
            client.writeQuery({
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
