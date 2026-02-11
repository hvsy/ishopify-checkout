import {get as _get} from "lodash-es";
import {getJsonFromMeta} from "@lib/metaHelper.ts";

let globalSettings : any = null;

export function getGlobalSettings(){
    if(globalSettings === null){
        globalSettings = getJsonFromMeta('settings',{});
        console.log('global settings:',globalSettings);
    }
    return globalSettings;
}

export function getGlobalPath(path : string,defaultValue : any = null){
    return _get(getGlobalSettings(),path,defaultValue);
}

export function PhoneOnlyRequired(){
    return getGlobalPath('phone.validate') === 'required';
}
