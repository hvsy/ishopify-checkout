import {usePlainScript} from "@hooks/usePlainScript.tsx";
import {useEffect, useRef} from "react";
import {useLocation} from "react-router-dom";
import {md5} from "js-md5";
import Events = Analytics.Events;

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
    usePlainScript(`${type}-pixel`, config.script);
    useEffect(() => {
        config.setup?.(config.pixels);
    }, [pathname, config.pixels.join('/')]);
    useEffect(() => {
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
    }, [config.pixels.join('/')]);
}
