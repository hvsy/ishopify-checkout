import {usePlainScript} from "@hooks/usePlainScript.tsx";
import {useEffect, useRef} from "react";
import {useLocation} from "react-router-dom";
import {md5} from "js-md5";
import Events = Analytics.Events;
import {getFilterPixels} from "@lib/pixelHelper.ts";

export type PixelConfig = {
    pixels : string[],
    script : string,
    setup ?: (pixels : string[])=>void;
    onEventCallback ?:<T extends keyof Events>(type : T,data : Events[T]['data'],extra : any)=>void;
};

export function usePlatformPixel(type : string,config : PixelConfig){
    const location = useLocation();
    const pathname = location.pathname;
    const mountedRef = useRef(false);
    const initedRef = useRef(false);
    let pixels =getFilterPixels(type,config.pixels);
    usePlainScript(`${type}-pixel`, config.script,false,pixels.length > 0);
    useEffect(() => {
        if(!pixels.length) return;
        if(initedRef.current) return;
        initedRef.current = true;
        config.setup?.(pixels);
    }, [pathname, pixels.join('/')]);
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
            config?.onEventCallback?.(type,others as Events[typeof type]['data'],extra);
        })
    }, [pixels.join('/')]);
}
