import {get as _get, trimStart} from "lodash-es";
import {getJsonFromMeta, getMetaContent} from "@lib/metaHelper.ts";

let globalSettings : any = null;

export function getGlobalSettings(){
    if(globalSettings === null){
        globalSettings = getJsonFromMeta('settings',{});
        import.meta.env.DEV && console.log('global settings:',globalSettings);
    }
    return globalSettings;
}

export function getGlobalPath(path : string,defaultValue : any = null){
    return _get(getGlobalSettings(),path,defaultValue);
}

export function PhoneOnlyRequired(){
    return getGlobalPath('phone.validate') === 'required';
}

export let GloablBase = getMetaContent('site_base');
export function getGlobalBase(){
    return GloablBase ? '/a/s/' + trimStart(GloablBase,'/') :   '/a/s';
}
