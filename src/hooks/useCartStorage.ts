import {useLoaderData, useParams, useRouteLoaderData} from "react-router-dom";
import {CartStorage} from "../shopify/context/CartStorage.ts";

export function useCartStorage(){
    // const {token} = useParams();
    // return useMemo(() => {
    //     return  new CartStorage(token!);
    // },[token]);
    // const {storage} = useLoaderData() as any;
    const {storage} = useRouteLoaderData('checkout_container') as any;
    return storage as CartStorage;
}
