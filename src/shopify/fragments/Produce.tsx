import {FC, useEffect, useRef} from "react";
import {api, getFinalPath} from "@lib/api.ts";
import dayjs from "dayjs";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {getShopifyY, getStorageValue} from "@lib/shopify.ts";

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
        const cookies : any = {

        };
        const sy = getShopifyY(true);
        if(!!sy){
            cookies['_shopify_y'] = sy;
        }
        const landing_url = getStorageValue('_landing_url');
        if(!!landing_url){
            cookies['_landing_url'] = landing_url;
        }
        const _fbp = Cookies.get('_fbp');
        if(!!_fbp){
            cookies['_fbp'] = _fbp;
        }
        const _fbc = Cookies.get('_fbc');
        if(!!_fbc){
            cookies['_fbc']= _fbc;
        }

        api({
            method : 'post',
            url  : getFinalPath(`/checkouts/${token}/produce`),
            data : {
                event,
                at : dayjs().toISOString(),
                cookies,
            }
        })
    }, [event]);
    return null;
};
