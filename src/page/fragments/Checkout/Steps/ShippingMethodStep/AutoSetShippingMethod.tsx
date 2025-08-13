import {FC, memo, useEffect, useRef} from "react";
import {useCurrentForm} from "../../../../../container/FormContext.ts";
import Form from "rc-field-form";
import {find as _find} from "lodash-es";
import ShippingLine = DB.ShippingLine;

export type AutoSetShippingMethodProps = {
    methods ?: ShippingLine[];
    value ?: any;
    onChange ?: (value : any)=>void;
};

export const AutoSetShippingMethod: FC<AutoSetShippingMethodProps> = memo((props) => {
    const {methods,value,onChange} = props;
    const form = useCurrentForm();
    const shipping_line_id = Form.useWatch('shipping_line_id',{
        form,
        preserve : true,
    });
    useEffect(() => {
        if(!methods || !methods.length) return;
        if(value?.id !== shipping_line_id){
            const hit=  _find(methods ||[], (method) => {
                return method.id === shipping_line_id
            });
            if(hit){
                onChange?.(hit);
            }
        }
    },[shipping_line_id,methods]);
    return null;
});
