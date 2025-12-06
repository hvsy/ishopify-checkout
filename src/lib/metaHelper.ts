import {isArray as _isArray,unescape as _unescape} from "lodash-es";
export function getMetaContent<T = any>(name: string, defaultValue: any | null = null) {
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
        const json = _unescape(content);
        return JSON.parse(json);
    }catch (e){
        return defaultValue;
    }
}
