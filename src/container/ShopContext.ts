import {createContext, use} from "react";



export const ShopContext = createContext<DB.Shop|null>(null);

export function useShop(){
    return use(ShopContext)!;
}
