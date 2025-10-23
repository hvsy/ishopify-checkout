import {useMemo} from "react";
export const ImageLoader = ({ src, width,height, quality } : {
    src : string,width?:number,height ?:number,quality ?: number}) => {
    const url = new URL(src);
    const prefix = `${url.protocol}//${url.host}${url.pathname}`;
    const processes = [];
    const resize =[];
    if(width){
        resize.push(`w_${width}`)
    }
    if(height){
        resize.push(`h_${height}`)
    }
    if(resize.length){
        processes.push(`resize,${resize.join(',')}`)
    }
    const qualities = [];
    if(quality){
        qualities.push(quality);
    }
    if(qualities.length > 0){
        processes.push(`quality,q_${qualities.join(',')}`)
    }
    let final = src;
    if(processes.length > 0){
        final = `${prefix}?x-oss-process=image/${processes.join('/')}`
    }
    if(process.env.NODE_ENV === 'production'){
        return final.replace('http://','https://');
    }
    return final;
}

export const defaultDeviceSizes= [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export function useSrcSet(finalUrl ?: string|null, deviceSizes : number[] = defaultDeviceSizes){
    return useMemo(() => {
        return finalUrl ? deviceSizes.map((size) => {
            return `${ImageLoader({
                src: finalUrl,
                width: size,
            })} ${size}w`;
        }).join(', ') : undefined
    },[finalUrl]);
}
