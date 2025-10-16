import {FC, useEffect, useRef} from "react";
import {api} from "@lib/api.ts";
import dayjs from "dayjs";
import {useParams} from "react-router-dom";

export type ProduceProps = {
    event : string;
};

export const Produce: FC<ProduceProps> = (props) => {
    const {event} = props;
    const {token} = useParams();
    const mountedRef = useRef(false);
    useEffect(() => {
        if(!!mountedRef.current) return;
        mountedRef.current = true;
        api({
            method : 'post',
            url  : `/a/s/checkouts/${token}/produce`,
            data : {
                event,
                at : dayjs().toISOString(),
            }
        })
    }, [event]);
    return null;
};
