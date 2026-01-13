import {createContext, FC, use, useEffect, useState} from "react";
import useSWR from "swr";
import {Pixels} from "../shopify/fragments/Pixels.tsx";
import {isString, get as _get} from "lodash-es";


export const PaymentContext = createContext<{
    method: DB.PaymentMethod | null;
    setMethod: (method: DB.PaymentMethod | null) => void;
    methods?: DB.PaymentMethod[],
    loading?: boolean,
    tracking?: any,
    zones?: any[],
} | null>(null);


export function usePaymentContext() {
    return use(PaymentContext) || null;
}

export function usePaymentMethod() {
    return usePaymentContext()?.method;
}

export function useAllZones() {
    const {data,isLoading} = useSWR("/a/s/api/zones/all");
    return {zones: data|| [], loading: isLoading};
}

export function useShippingZones() {
    const {data,isLoading} = useSWR('/a/s/api/zones',{
        errorRetryCount : 10,
    });
    return {
        zones : data || [],
        loading:isLoading,
    }
}

function preload(config: any) {
    const link = document.createElement('link');
    Object.keys(config).forEach((key) => {
        //@ts-ignore
        link[key] = config[key];
    })
    document.head.append(link);
}

export const PaymentContainer: FC<any> = (props) => {
    const {children} = props;
    const [method, setMethod] = useState<DB.PaymentMethod | null>(null);
    const {data: setup, isLoading} = useSWR<{
        tracking: any;
        payments: DB.PaymentMethod[],
        zones?: any[],
    }>(
        '/a/s/api/setup',{
            errorRetryCount : 10,
        }
    );
    useEffect(() => {
        if (!setup?.payments) return;
        (setup.payments || []).forEach((payment) => {
            (payment.preloads?.js || []).forEach((js) => {
                if (!js) return;
                const obj = isString(js) ? {
                    rel: 'preload',
                    href: js,
                    as: 'script',
                    type: 'text/javascript'
                } : js;
                preload(obj);
            });
            (payment.preloads?.css || []).forEach((css) => {
                if (!css) return;
                const obj = isString(css) ? {
                    rel: 'preload',
                    href: css,
                    as: 'style',
                    type: 'text/css'
                } : css;
                preload(obj);
            });
        })
    }, [!!setup]);
    return <PaymentContext value={{
        tracking: setup?.tracking || null,
        method,
        setMethod,
        methods: setup?.payments || [],
        loading: isLoading,
        zones: setup?.zones || [],
    }}>
        {children}
        {setup?.tracking && <Pixels tracking={setup.tracking}/>}
    </PaymentContext>
}
