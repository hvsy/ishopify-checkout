import Cookies from "js-cookie";
import LocalExpiredStorage from "./LocalExpiredStorage.ts";
import {getMetaContent} from "./metaHelper.ts";


export function getShopifyS(){
    const cv = Cookies.get('_shopify_s');
    if(!!cv) return cv;
    const ccv = Cookies.get('_custom_shopify_s');
    if(!!ccv) return ccv;
    try {
        const csy = LocalExpiredStorage.getItem('_custom_shopify_s') || null;
        if(!!csy) return csy;
    } catch (e) {

    }
    try {
        return sessionStorage.getItem('_custom_shopify_s') || null
    } catch (e) {
        return null;
    }
}
export function getShopifyY($ignoreMeta = false){
    if(!$ignoreMeta){
        const sy =  getMetaContent('sy');
        if(!!sy) {
            import.meta.env.DEV && console.log('meta sy:',sy);
            return sy;
        }
    }
    return getStorageValue('_shopify_y','_custom_shopify_y');
}

export function getStorageValue(name : string,storageName ?: string){
    const value = Cookies.get(name);
    if(!!value) return value;
    try {
        const sv = LocalExpiredStorage.getItem(storageName || name);
        if (!!sv) return sv;
    } catch (e) {
    }
    try {
        return sessionStorage.getItem(storageName || name) || null;
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
