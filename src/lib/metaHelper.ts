import {get,isObjectLike,isArray as _isArray,unescape as _unescape} from "lodash-es";
let mode : string = document.querySelector(`meta[name='mode']`)?.getAttribute?.('content') || 'normal';
import.meta.env.DEV && console.log('checkout response mode:',mode);
export function getMetaContent<T = any>(name: string, defaultValue: any | null = null) {
    if(mode === 'stream'){
        const value = get(window.global_meta,name,defaultValue);
        import.meta.env.DEV && console.log('get meta content:',name,value);
        return value;
    }else{
        const meta = document.querySelector(`meta[name='${name}']`);
        let content = meta?.getAttribute?.('content');
        if (content) {
            content = content.trim()
            if (content.indexOf('{{') !== -1 || content.indexOf('{!') !== -1) {
                return defaultValue;
            } else {
                return content;
            }
        } else {
            return defaultValue;
        }
    }
}
export function getArrayFromMeta(name: string): string[] {
    const content = getMetaContent(name, '');
    const items = content.split(',').filter(Boolean);
    if(_isArray(items)) return items;
    return [];
}
export function getJsonFromMeta(name: string,defaultValue : any = {}): any {
    const content = getMetaContent(name, '');
    try{
        if(!content) return defaultValue;
        if(isObjectLike(content)) return content;
        const json = _unescape(content);
        return JSON.parse(json);
    }catch (e){
        return defaultValue;
    }
}

export function getIntFromMeta(name : string,defaultValue  : number= 0){
    const content = getMetaContent(name);
    try{
        const value = parseInt(content);
        if(isNaN(value)) return defaultValue;
        return value;
    }catch(e){
        return defaultValue;
    }
}
export function getBooleanFromMeta(name : string,defaultValue : boolean = false){
    const content = getMetaContent(name);
    if(!content) return defaultValue;
    if(['true','on','1','checkted'].includes(content)) return true;
    if(['false','off','0','uncheckted'].includes(content)) return false;
    return defaultValue;
}
