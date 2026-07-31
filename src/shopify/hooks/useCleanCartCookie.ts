import {useEffect} from "react";
import Cookies from "js-cookie";

export function useCleanCartCookie(gid ?: string){
    useEffect(() => {
        if(!gid){
            return;
        }
        const token = Cookies.get('cart');
        const after = decodeURIComponent(gid).replace('gid://shopify/Cart/','');
        if(decodeURIComponent(token||'') === after){
            Cookies.remove('cart');
        }
    }, [gid]);
}
