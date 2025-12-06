import {getJsonFromMeta} from "./metaHelper.ts";
import {getStorageValue} from "./shopify.ts";
import {md5} from "js-md5";

export const strict_pixel_config : (null|{
    platforms ?: string[];
    pixel_id_names ?: string[];
}) = getJsonFromMeta('strict_pixel',null) || null;

export let current_pixel_params : null|string[] = null;

export function getPixelParams() : string[]{
    if(!strict_pixel_config) return [];
    const lurl = getStorageValue('_landing_url');
    if(!lurl) return [];
    try {
        const url = new URL(lurl);
        return (strict_pixel_config.pixel_id_names || []).map((pn) => {
            const v = url.searchParams.get(pn);
            return v?.trim() || null;
        }).filter(Boolean) as string[];
    }catch (e){
        return [];
    }
}

export function getCurrentPixelParams(){
    if(current_pixel_params === null){
        current_pixel_params = getPixelParams();
    }
    return current_pixel_params;
}

export function getFilterPixels(platform : string,pixels ?: string[]){
    if(!strict_pixel_config){
        return pixels || [];
    }
    if(!strict_pixel_config?.platforms?.includes(platform)){
        return pixels || [];
    }
    return (pixels||[]).filter((p) => {
        return (getCurrentPixelParams()||[]).includes(p) || (getCurrentPixelParams()||[]).includes(md5(p));
    });
}
