import {createContext, FC, useState} from "react";
import useSWR from "swr";
import {api} from "@lib/api.ts";

const ShopifyDiscountCodeContext = createContext<{
    discountCodes ?: any[];
    loading : boolean,
}>({
    loading : false,
});





export const ShopifyDiscountCodeProvider : FC<any> = (props) => {
    const {children,codes} = props;
    const {data,isLoading} = useSWR((!!codes?.length) ? [`/a/s/api/discounts`,codes.join(',')] : null, ([url,code]) => {
        return api<any[]>({
            method : 'post',
            url : '/a/s/api/discounts',
            data : {
                codes : code.split(',').filter((c:any)=>!!c),
            }
        });
    });
    return <ShopifyDiscountCodeContext value={{
        discountCodes:  data || [],
        loading : isLoading,
    }}>
        {children}
    </ShopifyDiscountCodeContext>;
}
