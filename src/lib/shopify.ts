import Cookies from "js-cookie";
import LocalExpiredStorage from "./LocalExpiredStorage.ts";

export function getShopifyY(){
    const cv = Cookies.get('_shopify_y');
    if(!!cv) return cv;
    return LocalExpiredStorage.getItem('_custom_shopify_y') || null;
}

export function getStorageValue(name : string){
    const value = Cookies.get(name);
    if(!!value) return value;
    const sv = LocalExpiredStorage.getItem(name);
    return sv || null;
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
