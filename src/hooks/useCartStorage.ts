import {useLoaderData, useParams} from "react-router-dom";
import {CartStorage} from "../shopify/context/CartStorage.ts";

export function useCartStorage(){
    // const {token} = useParams();
    // return useMemo(() => {
    //     return  new CartStorage(token!);
    // },[token]);
    const {storage} = useLoaderData() as any;
    return storage as CartStorage;
}
