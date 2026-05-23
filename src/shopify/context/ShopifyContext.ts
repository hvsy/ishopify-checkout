// import {createContext, use} from "react";
import Big from "big.js";
import {moneyFormat} from "../lib/helper.ts";

// export const ShopifyContext = createContext<any>({
//     shop :null
// });


export function useMoneyFormat(){
    return (data : any,free : string|null = null)=>{
        const {amount,currencyCode} = data || {};
        if(amount === undefined) return null;
        if(!!free && Big(amount).cmp(0) === 0){
            return free;
        }
        if(currencyCode){
            return moneyFormat({
                amount : data.amount,
                currencyCode,
            })
        }
    };
}
