import axios, {AxiosRequestConfig} from "axios";
import {get as _get,trimEnd} from "lodash-es";
import dayjs from "dayjs";
import axiosRetry from "axios-retry";
import {_start} from "../shopify/lib/helper.ts";
import {GloablBase} from "../shopify/lib/globalSettings.ts";

// const baseURL = getBaseUrl();
export const AxiosInstance = axios.create({
    // baseURL : baseURL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept' : 'application/json',
    },
    withCredentials: false,
});
axiosRetry(AxiosInstance,{retries : 3,});

export function getGetPathBase(base : string = GloablBase){
    if(!base || base === '/'){
        return "/a/s";
    }else{
        return  '/a/s'+_start(trimEnd(base ,'/'),'/');
    }
}

export function getReplacePathBase(path : string,base : string = GloablBase){
    const pb = getGetPathBase(base);
    if(path.indexOf(pb) === 0){
        return path;
    }else{
        return path.replace('/a/s',pb);
    }
}
export function getFinalPath(path  : string,base : string = GloablBase){
    const temp = _start(path,'/');
    if(!base || base === '/'){
        return "/a/s" + temp;
    }else{
        return  '/a/s'+_start(trimEnd(base ,'/'),'/') + temp;
    }
}
const SWRAxiosInstance = axios.create({
    // baseURL : baseURL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept' : 'application/json',
    },
    withCredentials: false,
});
export function swr_api<T = any>(config : AxiosRequestConfig & {authRedirect ?: boolean}){
    return SWRAxiosInstance.request<T>(config).then(r=>r.data, (error) => {
        if(_get(error,'response.status') === 404){
            return null;
        }
        throw error;
    });
}
export function api<T = any>(config : AxiosRequestConfig & {authRedirect ?: boolean}){
    return AxiosInstance.request<T>(config).then(r=>r.data, (error) => {
        if(_get(error,'response.status') === 404){
            return null;
        }
        throw error;
    });
}

export async function produce(token: string, action: string, payload: any) {
    return api({
        method: 'post',
        url: getFinalPath(`/api/checkouts/${token}/produce/${action}`),
        data: {
            payload,
        }
    });
}
export function loaded(token : string,event : string){
    return api({
        method : 'post',
        url  : getFinalPath(`/checkouts/${token}/produce`),
        data : {
            event,
            at : dayjs().toISOString(),
        }
    })
}



