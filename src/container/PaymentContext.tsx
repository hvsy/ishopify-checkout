import {createContext, Dispatch, FC, lazy, SetStateAction, use, useEffect, useState} from "react";
import useSWR from "swr";
import {ErrorBoundary} from "react-error-boundary";
import {Setup} from "@lib/flags.ts";
import {isString} from "lodash-es";
const Pixels = lazy(()=>{
    return import("../shopify/fragments/Pixels").then(m=>{
        return {default : m.Pixels}
    })
})


export const PaymentContext = createContext<{
    method: DB.PaymentMethod | null;
    setMethod: (method: DB.PaymentMethod | null) => void;
    methods?: DB.PaymentMethod[],
    loading?: boolean,
    tracking?: any,
    zones?: any[],
    progress?: string;
    setProgress?: Dispatch<SetStateAction<string | undefined>>;
    suggestZipCode ?: string;
    setSuggestZipCode ?: Dispatch<SetStateAction<string | undefined>>;
} | null>(null);


export function usePaymentContext() {
    return use(PaymentContext) || null;
}

export function usePaymentMethod() {
    return usePaymentContext()?.method;
}

export function useAllZones() {
    const {data, isLoading} = useSWR("/a/s/api/zones/all");
    return {zones: data || [], loading: isLoading};
}

export function useShippingZones() {
    const {data, isLoading} = useSWR('/a/s/api/zones', {
        errorRetryCount: 10,
    });
    return {
        zones: data || [],
        loading: isLoading,
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
type CheckoutSetup = {
    tracking: any;
    payments: DB.PaymentMethod[],
    zones?: any[],
}
export function useSetup(){
    if(!!Setup){
        return {setup : Setup as CheckoutSetup,isLoading : false,inner:true}
    };
    const {data, isLoading} = useSWR<CheckoutSetup>(
        '/a/s/api/setup', {
            errorRetryCount: 10,
        }
    );
    return {setup : data,isLoading,inner : false};
}
export const PaymentContainer: FC<any> = (props) => {
    const {children} = props;
    const {setup, isLoading,inner} = useSetup();
    const [method, setMethod] = useState<DB.PaymentMethod | null>(null);
    const [progress, setProgress] = useState<string | undefined>();
    const [suggestZipCode, setSuggestZipCode] = useState<string|undefined>();
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
        methods: setup?.payments || [],
        zones: setup?.zones || [],
        method,
        setMethod,
        loading: isLoading,
        progress,
        setProgress,
        suggestZipCode,
        setSuggestZipCode,
    }}>
        {children}

        {setup?.tracking && <ErrorBoundary onError={() => {}} fallback={null}>
            <Pixels tracking={setup.tracking}/>
        </ErrorBoundary>}

    </PaymentContext>
}
