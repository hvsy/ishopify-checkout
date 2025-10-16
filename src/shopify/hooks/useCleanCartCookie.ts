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
        const hit = after.split("?key=")?.[0];
        console.log('token:',gid,token,after,hit);
        localStorage.removeItem(`cart:${hit}`);
        if(localStorage.getItem("cartToken") === JSON.stringify(hit)){
            localStorage.removeItem('cartToken');
        }
    }, [gid]);
}
