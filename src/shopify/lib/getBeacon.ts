import {omit as _omit} from "lodash-es";
import {FormInstance} from "rc-field-form";

export function getBeacon(form : FormInstance,context : string){
    const data : any = {
        context,
        ... _omit(form.getFieldsValue(),['shipping_line','shipping_address.region','shipping_address.state',
            'billing_address.region','billing_address.state'
        ]),
    };
    if(!data?.email) return null;
    return data;

}
