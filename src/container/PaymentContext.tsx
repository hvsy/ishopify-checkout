import {createContext, FC, use, useEffect, useState} from "react";
import useSWR from "swr";
import {Pixels} from "../shopify/fragments/Pixels.tsx";

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
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = js;
                link.as = 'script';
                document.head.append(link);
            });
            (payment.preloads?.css || []).forEach((css) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = css;
                link.as = 'style';
                document.head.append(link);
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
