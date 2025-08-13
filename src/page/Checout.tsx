import {FC, lazy, useEffect,} from "react";
import {useParams} from "react-router-dom";
import {CheckoutMain} from "./fragments/Checkout/CheckoutMain.tsx";
import {CheckoutContainer, } from "../container/CheckoutContext.ts";
import {CurrencyContext} from "../container/CurrencyContext.ts";
import {ShopContext} from "../container/ShopContext.ts";
import {PaymentContainer, } from "../container/PaymentContext.tsx";
import {LazyRender} from "@components/fragments/LazyRender.tsx";
const Tracking = lazy(async () => {
    const m = await import('./components/Tracking');
    return {
        default : m.Tracking,
    }
})


export const Container : FC<{value : DB.Checkout}> = (props) => {
    const {value,} = props;
    useEffect(() => {
        document.title = `Checkout - ${value?.shop?.title || value?.shop?.name}`;
    },[]);
    const tracking = value?.shop?.preference?.tracking;
    return <ShopContext value={value?.shop}>
        <CurrencyContext.Provider value={value?.currency}>
            <PaymentContainer>
                <CheckoutMain/>
                {tracking && <LazyRender render={() => {
                    return <Tracking tracking={tracking}/>
                }} />}

            </PaymentContainer>
        </CurrencyContext.Provider>
    </ShopContext>
};
export const Checkout: FC<any> = (() => {
    const params = useParams<{ token: string, action?: string }>();
    const {token} = params;
    return <CheckoutContainer.Provider token={token} Component={Container}/>
});
