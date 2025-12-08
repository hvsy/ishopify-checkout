import Cookies from "js-cookie";
import LocalExpiredStorage from "./LocalExpiredStorage.ts";

export function getShopifyY(){
    const cv = Cookies.get('_shopify_y');
    if(!!cv) return cv;
    try {
        const csy = LocalExpiredStorage.getItem('_custom_shopify_y') || null;
        if(!!csy) return csy;
    } catch (e) {

    }
    try {
        return sessionStorage.getItem('_custom_shopify_y') || null
    } catch (e) {
        return null;
    }
}

export function getStorageValue(name : string){
    const value = Cookies.get(name);
    if(!!value) return value;
    try {
        const sv = LocalExpiredStorage.getItem(name);
        if (!!sv) return sv;
    } catch (e) {
    }
    try {
        return sessionStorage.getItem(name) || null;
    } catch (e) {
        return null;
    }
}

export function getStorage(map : any){
    const values : any = {};
    (Object.keys(map).map(async(key) => {
        const vk = map[key];
        const v = getStorageValue(vk);
        if(!!v){
            values[key] = v;
        }
    }));
    return values;
}
