import {useParams} from "react-router-dom";
import {api} from "@lib/api.ts";
import {get as _get} from "lodash-es";
import {useCartCache} from "@query/checkouts/cache/useCartCache.ts";
import {useCallback} from "react";
import {useCartStorage} from "./useCartStorage.ts";
import {useCurrentForm} from "../container/FormContext.ts";

export function useCheckoutSync(){
    const {token} = useParams();
    const cache = useCartCache();
    const storage = useCartStorage();
    const form = useCurrentForm();
    return useCallback(async () => {
        const cached = cache(storage.gid);
        const request = _get(cached,'cart');
        const email = form.getFieldValue('email');
        if(!(email)) return;
        const  response = await api({
            method : "put",
            url : `/a/s/checkouts/${token}`,
            data : {
                email,
                remote_data : request,
            }
        });
        return {
            request,
            response,
        }
    },[token])

}
