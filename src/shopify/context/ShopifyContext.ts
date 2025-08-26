import {createContext, use} from "react";
import {Currency} from "lucide-react";
import {useParams} from "react-router-dom";
import {gql, useApolloClient} from "@apollo/client";
import Big from "big.js";

export const ShopifyContext = createContext<any>({
    shop :null
});
export function useShopifyBasename(){
    const {token} = useParams();
    return `/a/s/checkouts/${token}`;
}

export function useShopify(){
    return use(ShopifyContext).shop;
}
export function useMoneyComplied(variables : any = {}){
    const ctx = use(ShopifyContext);
    return ctx.shop?.format?.(variables);
}

export function useMoneyFormat(){
    const ctx = use(ShopifyContext);
    return (data : any,free : string|null = null)=>{
        const {amount,currencyCode} = data || {};
        if(amount === undefined) return null;
        if(!!free && Big(amount).cmp(0) === 0){
            return free;
        }
        if(currencyCode){
            return new Intl.NumberFormat(navigator.languages, {
                style: "currency", currency: currencyCode,
                currencyDisplay : 'narrowSymbol',
            }).format(data.amount,);
        }
        return ctx?.shop?.format?.(data);
    };
}

export function useCacheQuery(queries: string[],variables : any = {}){
    const client = useApolloClient();
    return client.readQuery({
        query : gql(queries.join("\n")),
        variables,
    })
}
