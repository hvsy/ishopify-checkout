import {FC, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {AlertCircleIcon} from "lucide-react";
import {useEventListener} from "usehooks-ts";
import {isString} from "lodash-es";

export type PaymentErrorProps = {};

export const PaymentError: FC<PaymentErrorProps> = (props) => {
    const {} = props;
    const [search,] = useSearchParams();
    const [methodError,setMethodError] = useState<string|boolean>(false);
    const error = search.get('error');
    useEventListener('message', (e) => {
        // console.log('window message event listener:',e);
        const data = e.data || {};
        const {type,event} = data;
        switch(event){
            case 'validate':{
                return;
            }
            case "payment_failed":{
                try {
                    if (data?.hasOwnProperty('msg')) {
                        const msg = data?.msg;
                        if (!!msg && isString(msg)) {
                            setMethodError(msg);
                            return;
                        }
                    }
                } catch (e) {
                }
                setMethodError(true);
            }
            return;
            case 'reset_error':{
                setMethodError(false);
            }
            return;
        }
    });
    if (error === 'PAYMENT_ERROR' || !!methodError){
        const tip = isString(methodError) ? methodError : `Unfortunately, we can't process your payment`;
        return <div
            className={'border-1 border-gray-300 bg-red-100 rounded px-5 py-3 flex flex-row items-center space-x-2'}>
            <div>
                <AlertCircleIcon className={'text-red-500'}/>
            </div>
            <div className={'text-sm text-gray-600'}>
                {tip}. Select a different payment option or replace your credit card.
            </div>
        </div>
    }
    return null;
};
