import {useParams} from "react-router-dom";
import {api} from "@lib/api.ts";
import {get as _get} from "lodash-es";
import {useCartCache} from "@query/checkouts/cache/useCartCache.ts";
import {useCallback} from "react";
import {useCartStorage} from "./useCartStorage.ts";
import {useCurrentForm} from "../container/FormContext.ts";
import {FormInstance} from "rc-field-form";
import {omit as _omit} from "lodash-es";
import {buildAddress} from "@lib/buildAddress.ts";

export function useCheckoutSync(form?:FormInstance){
    const {token} = useParams();
    const cache = useCartCache();
    const storage = useCartStorage();
    let formInstance  = useCurrentForm();
    if(form){
        formInstance = form;
    }
    return useCallback(async (needEmail  : boolean = true,update_remote_data : boolean = true) => {
        const cached = cache(storage.gid);
        const request = _get(cached,'cart');
        const email = formInstance.getFieldValue('email');
        const localization = formInstance.getFieldValue('localization');
        if(!(email) && needEmail) return;
        const json : any = update_remote_data ? {
            remote_data : request,
            quickly : !needEmail,
        } : {
            quickly : !needEmail,
        };
        if(needEmail){
            json['email'] = email;
        }
        if(localization){
            json['localization'] = localization;
        }
        const billing_address = formInstance.getFieldValue('billing_address') || null;
        let billing = billing_address ? buildAddress(_omit(billing_address,'region','state')) : null;
        const  response = await api({
            method : "put",
            url : `/a/s/checkouts/${token}`,
            data : {
                ...json,
                billing_address : billing,
            },
        });
        return {
            request : {
                ...request,
                billing_address : billing,
            },
            response,
        }
    },[token])

}
