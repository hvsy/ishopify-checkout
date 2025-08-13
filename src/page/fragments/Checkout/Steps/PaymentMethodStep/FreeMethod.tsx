import {FC, useEffect} from "react";
import {FreeTag} from "./FreeTag.tsx";
import {usePaymentContext, usePaymentMethod} from "../../../../../container/PaymentContext.tsx";

export type FreeMethodProps = {};

export const FreeMethod: FC<FreeMethodProps> = (props) => {
    const { } = props;
    const ctx = usePaymentContext()
    useEffect(() => {
        ctx?.setMethod(null)
    }, []);
    return <div className="flex flex-col items-center justify-center py-10 space-y-2 border rounded border-gray-300">
        <FreeTag className={'size-24 fill-gray-400'}/>
        <div className={'text-sm'}>Your order is free. No payment is required</div>
    </div>;
};
