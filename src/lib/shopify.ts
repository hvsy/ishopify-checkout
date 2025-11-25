import Cookies from "js-cookie";
import LocalExpiredStorage from "./LocalExpiredStorage.ts";

export function getShopifyY(){
    const cv = Cookies.get('_shopify_y');
    if(!!cv) return cv;
    return LocalExpiredStorage.getItem('_custom_shopify_y') || null;
}
