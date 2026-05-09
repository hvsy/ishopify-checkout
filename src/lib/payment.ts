import {api, getFinalPath} from "./api.ts";

export async function getOrder(token : string,thankYou : boolean = false){
    return await api({
        method : 'get',
        url : getFinalPath(thankYou ? `/api/orders/${token}/thank-you` :
            `/api/orders/${token}`),
    });
}
