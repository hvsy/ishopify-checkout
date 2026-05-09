import {usePlainScript} from "@hooks/usePlainScript.tsx";
import {useEffect, useEffectEvent, useRef} from "react";
import {useLocation} from "react-router-dom";
import {md5} from "js-md5";
import Events = Analytics.Events;
import {getFilterPixels} from "@lib/pixelHelper.ts";
import {intersection, isEmpty, isObjectLike} from "lodash-es";
import {parseSkuCategories} from "../../shopify/lib/helper.ts";

export type PixelConfig = {
    pixels : (string|any)[],
    regex ?: string[],
    script : string,
    setup ?: (pixels : (string|any)[])=>void;
    onEventCallback ?:<T extends keyof Events>(type : T,data : Events[T]['data'],extra : any,each : (callback : (pxid:string)=>void,skus: (string|null|undefined)[])=>void)=>void;
};

export function usePlatformPixel(type : string,config : PixelConfig){
    const location = useLocation();
    const pathname = location.pathname;
    const mountedRef = useRef(false);
    const initedRef = useRef(false);
    let pixels =getFilterPixels(type,config.pixels);
    let regex = config.regex;
    usePlainScript(`${type}-pixel`, config.script,false,pixels.length > 0);
    useEffect(() => {
        if(!pixels.length) return;
        if(initedRef.current) return;
        initedRef.current = true;
        config.setup?.(pixels);
    }, [pathname, pixels.join('/')]);
    const each = useEffectEvent((callback : (pxid: string)=>void,skus: (string|null|undefined)[]) => {
        const categories = parseSkuCategories(regex!,skus);
        pixels.forEach((px) => {
            let id =px;
            if(isObjectLike(px)){
                id = px.pixel_id;
                if(!isEmpty(px.categories)){ // 像素设置分类
                    if(isEmpty(categories)){ // 内容没有分类
                        console.log('产品没有分类信息:',px,categories)
                        return;
                    }else{
                        if(isEmpty(intersection(categories || [],px.categories))){
                            console.log('分类不匹配:',px,categories)
                            return;  //像素的分类和内容的分类不匹配
                        }
                    }
                }
            }
            callback(id);
        })
    });
    useEffect(() => {
        if(!pixels.length) return;
        if(mountedRef.current) return;
        mountedRef.current = true;
        window.listen?.((type,event)=>{
            const {eventId,...others} = event.data || {};
            const extra : any = {

            }
            if(eventId){
                extra.event_id = md5(eventId);
            }
            config?.onEventCallback?.(type,others as Events[typeof type]['data'],extra,each);
        })
    }, [pixels.join('/')]);
}
