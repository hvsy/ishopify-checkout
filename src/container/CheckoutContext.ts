import {createSWRContainer} from "@lib/SimpleContainer.tsx";
import useSWR from "swr";

export type CheckoutContext = {
    url : string,
    path : (path : string)=>string
} & DB.Checkout;


export const CheckoutContainer = createSWRContainer<CheckoutContext>(({token} : any) => {
    const url = `/checkouts/${token}`;
    return useSWR(url);
}, ({error}) => {
    if(error?.response.status === 404){
        return 'Not Found';
    }
});


export function useCheckout(){
    return CheckoutContainer.use();
}

export function useBasename(){
    const checkout = useCheckout();
    const token = checkout?.token;
    return `/checkouts/${token}`;
}

