import {FC, useEffect, useRef, useState} from "react";
import {capitalize} from "lodash-es";

export type PaypalFieldProps = {
    fields : any,id : string,
    placeholder:string,
    field : string,
    config ?: any,
    className ?: string;
    error ?: string|null;
    onInputChange ?: any;
};

const style = {
    input : {
        padding:'0.6rem',
    }
}
export const PaypalField: FC<PaypalFieldProps> = (props) => {
    const {error,id,onInputChange,fields,placeholder,field,config = {},className = ''} = props;
    const mountedRef = useRef(false);
    useEffect(() => {
        if(mountedRef.current) return;
        mountedRef.current = true;

        const key = field + 'Field';
        fields[key]?.({
            style,
            placeholder,
            inputEvents:{
                onChange : onInputChange,
            },
            ...config,
        }).render(`#paypal-card-${id}`)
    }, []);
    return <div id={`paypal-card-${id}-container`} className={`flex flex-col space-y-0 ${className}`}>
        <div id={`paypal-card-${id}`} className={''}></div>
        {!!error && <div className={'text-red-500 ml-2'}>{error}</div>}
    </div>;
};
