import {CartStorage} from "../shopify/context/CartStorage.ts";
import {useCurrentLoaderData} from "../shopify/checkouts/hooks/useCurrentLoaderData.tsx";

export function useCartStorage(){
    const {storage} = useCurrentLoaderData();
    return storage as CartStorage;
}
