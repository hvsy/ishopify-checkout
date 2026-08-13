import {omit as _omit} from "lodash-es";
import {FormInstance} from "@rc-component/form";

export function getBeacon(form : FormInstance,context : string){
    const values = form.getFieldsValue();
    const data : any = {
        context,
        ... _omit(values,['shipping_line']),
    };
    if(data.shipping_address){
        data.shipping_address = _omit(data.shipping_address, ['region','state']);
    }
    if(data.billing_address){
        data.billing_address = _omit(data.billing_address, ['region','state']);
    }
    if(!data?.email) return null;
    return data;

}
