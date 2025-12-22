import {FC, useEffect} from "react";
import mitt from "mitt";
import {getMetaContent} from "@lib/metaHelper.ts";

export type AnalyticsProps = {};

export const Analytics: FC<AnalyticsProps> = (props) => {
    const {} = props;
    useEffect(() => {
        const id = getMetaContent("clarity");
        if(!!id){
            import('@microsoft/clarity').then((m) => {
                const clarity  =m.default
                clarity.init(id);
            })
        }
    }, []);
    useEffect(() => {
        let memory = new Map<ReportEvent,any>();
        window.Analytics = mitt();
        window.report= (name,data,eventId)=>{
            if(["checkout_started","purchase"].includes(name)){
                memory.set(name,{
                    ...data,
                    eventId,
                });
            }
            //@ts-ignore
            window.Analytics?.emit(name,{name, data : {...data,eventId}})
        };
        window.listen = (callback : (key  : ReportEvent,data : {name : typeof key,data : Analytics.Events[typeof key]['data']})=>void)=>{
            window.Analytics.on('*',callback);
            memory.forEach((data,key) => {
                callback(key,{
                    name : key,
                    data,
                });
            });
        };
    }, []);
    return null;
};
