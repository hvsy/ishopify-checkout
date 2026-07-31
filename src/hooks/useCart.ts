import {useParams} from "react-router-dom";
import {getCartApi, getCartBeacon, getCartGid} from "@lib/cart.ts";
import {getMetaContent} from "@lib/metaHelper.ts";

export function useCart(){
    const {token, shop} = useParams();
    const key = getMetaContent('cart_key');
    return {
        token: token || '',
        gid: getCartGid(token, key),
        api: getCartApi(token, shop),
        beacon: getCartBeacon(token, shop),
    };
}
