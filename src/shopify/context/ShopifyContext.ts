import {createContext, use} from "react";
import {Currency} from "lucide-react";
import {useParams} from "react-router-dom";
import {gql, useApolloClient} from "@apollo/client";

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
    return (data : any)=>{
        if(data?.amount === undefined) return null;
        const currencyCode = data.currencyCode;
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
