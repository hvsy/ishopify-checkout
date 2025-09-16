import {ReactNode, useEffect, useRef,} from "react";

export type ReportProps<key extends ReportEvent> = {
    name: key;
    // data: Omit<Analytics.Events[key]['data'],"currency"|"price">;
    data: Analytics.Events[key]['data'];
    price ?: string;
    token : string;
};

export function Report<key extends ReportEvent>(props : ReportProps<key>) : ReactNode{
    const {token,data,name} = props;
    const mounted = useRef(false);
    useEffect(() => {
        if(mounted.current) return;
        mounted.current = true;
        // console.log('report effect');
            window?.report?.(name,data as unknown as Omit<Analytics.Events[key]["data"], "eventId">,
                token + '_' + name);
    }, [token,name]);
    return null;
}
