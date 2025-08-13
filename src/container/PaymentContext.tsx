import {createContext, FC, use, useState} from "react";

export const PaymentContext = createContext<{
    method : DB.PaymentMethod|null;
    setMethod : (method : DB.PaymentMethod|null)=>void;
} | null>(null);


export function usePaymentContext(){
    return use(PaymentContext);
}

export function usePaymentMethod(){
    return usePaymentContext()?.method;
}

export const PaymentContainer  : FC<any> = (props) => {
    const {children} = props;
    const [method,setMethod] = useState<DB.PaymentMethod|null>(null);
    return <PaymentContext value={{
        method,
        setMethod,
    }}>
        {children}
    </PaymentContext>
}
