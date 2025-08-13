import axios, {AxiosRequestConfig} from "axios";
import {getBaseUrl} from "./getBaseUrl.ts";
import {get as _get} from "lodash-es";

// const baseURL = getBaseUrl();
export const AxiosInstance = axios.create({
    // baseURL : baseURL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept' : 'application/json',
    },
    withCredentials: false,
});

export function api<T = any>(config : AxiosRequestConfig & {authRedirect ?: boolean}){
    return AxiosInstance.request<T>(config).then(r=>r.data, (error) => {
        if(_get(error,'response.status') === 404){
            return null;
        }
        throw error;
    });
}



