import axios, {AxiosRequestConfig} from "axios";
import {getBaseUrl} from "./getBaseUrl.ts";
import {get as _get} from "lodash-es";
import dayjs from "dayjs";
import axiosRetry from "axios-retry";

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

export function loaded(token : string,event : string){
    return api({
        method : 'post',
        url  : `/a/s/checkouts/${token}/produce`,
        data : {
            event,
            at : dayjs().toISOString(),
        }
    })
}



