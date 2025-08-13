import {useApolloClient} from "@apollo/client";
import {CacheCartQuery} from "./caches.ts";

export function useCartCache(){
    const client = useApolloClient();
    return (cartId : string)=>{
        return client.cache.read({
            query : CacheCartQuery,
            returnPartialData : true,
            variables : {
                cartId,
                first : 10,
                withCarrierRates : true,
            },
            optimistic:false,
        },);
        // return client.readQuery({
        //     query : CacheCartQuery,
        //     variables : {
        //         cartId,
        //         first : 10,
        //     }
        // });
    }
}
