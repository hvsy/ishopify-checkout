import {createContext, FC, use, useState} from "react";
import useSWR from "swr";

export const PaymentContext = createContext<{
    method : DB.PaymentMethod|null;
    setMethod : (method : DB.PaymentMethod|null)=>void;
    methods ?: DB.PaymentMethod[],
    loading ?: boolean,
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
    const {data: methods,isLoading} = useSWR<DB.PaymentMethod[]>(('/a/s/api/payments'));
    return <PaymentContext value={{
        method,
        setMethod,
        methods,
        loading : isLoading,
    }}>
        {children}
    </PaymentContext>
}
