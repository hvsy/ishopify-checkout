import {createContext, FC, use, useEffect, useState} from "react";
import useSWR from "swr";
import {Pixels} from "../shopify/fragments/Pixels.tsx";
import {isString} from "lodash-es";

export const PaymentContext = createContext<{
    method : DB.PaymentMethod|null;
    setMethod : (method : DB.PaymentMethod|null)=>void;
    methods ?: DB.PaymentMethod[],
    loading ?: boolean,
    tracking ?: any,
} | null>(null);


export function usePaymentContext(){
    return use(PaymentContext) || null;
}

export function usePaymentMethod(){
    return usePaymentContext()?.method;
}

function preload(config : any){
    const link = document.createElement('link');
    Object.keys(config).forEach((key) => {
        //@ts-ignore
        link[key] = config[key];
    })
    document.head.append(link);
}
export const PaymentContainer  : FC<any> = (props) => {
    const {children} = props;
    const [method,setMethod] = useState<DB.PaymentMethod|null>(null);
    // const {data: methods,isLoading} = useSWR<DB.PaymentMethod[]>(('/a/s/api/payments'));
    const {data: setup,isLoading} = useSWR<{
        tracking : any;
        payments : DB.PaymentMethod[],
    }>(('/a/s/api/setup'));
    useEffect(() => {
        if(!setup?.payments) return;
        (setup.payments|| []).forEach((payment) => {
            (payment.preloads?.js || []).forEach((js) => {
                if(!js) return;
                const obj = isString(js) ? {
                    rel : 'preload',
                    href : js,
                    as : 'script',
                    type : 'text/javascript'
                } : js;
                preload(obj);
            });
            (payment.preloads?.css || []).forEach((css) => {
                if(!css) return;
                const obj = isString(css) ? {
                    rel : 'preload',
                    href : css,
                    as : 'style',
                    type : 'text/css'
                } : css;
                preload(obj);
            });
        })
    }, [!!setup]);
    return <PaymentContext value={{
        tracking : setup?.tracking || null,
        method,
        setMethod,
        methods : setup?.payments || [],
        loading : isLoading,
    }}>
        {children}
        {setup?.tracking && <Pixels tracking={setup.tracking} />}
    </PaymentContext>
}
