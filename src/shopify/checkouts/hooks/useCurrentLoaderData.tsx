import {useParams, useRouteLoaderData} from "react-router-dom";
import {useReadQuery} from "@apollo/client";

export function useCurrentLoaderData(){
    const {shop : shop_param} = useParams();
    const all = useRouteLoaderData(shop_param ?'shop_checkout_container' :'checkout_container') as any;
    return {
        ...all,
        shop_param,
    }
}

export function useCurrentReadQuery(){
    const {ref} = useCurrentLoaderData();
    return useReadQuery(ref) as any;
}
