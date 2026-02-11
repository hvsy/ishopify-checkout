import Validators from "validator";
import { getJsonFromMeta} from "@lib/metaHelper.ts";
import {isArray} from "lodash-es";

export function getBy(target : any,...paths : string[]){
    for(let i = 0;i<paths.length; ++i){
        const path = paths[i];
        if(target.hasOwnProperty(path)){
            return target[path];
        }
    }
    return null;
}

export function moneyFormat(data : any,display :  Intl.NumberFormatOptions['currencyDisplay'] = 'narrowSymbol'){
    if(!data || (data.amount === undefined) || (data.currencyCode === undefined)){
        return null;
    }
    return new Intl.NumberFormat(navigator.languages, {
        style: "currency", currency: data.currencyCode,
        // currencyDisplay : 'narrowSymbol',
        currencyDisplay : display
    }).format(data.amount,);
}

import { PhoneNumberUtil } from 'google-libphonenumber';
import {getCountry} from "react-international-phone";
import {PhoneOnlyRequired} from "./globalSettings.ts";

export function getCountryCode4(phone : string){
    try {
        const util = new PhoneNumberUtil();
        const phoneInput = util.parseAndKeepRawInput(phone);
        const code = phoneInput.getCountryCode()?.toString()?.replace(/\s/g,'');
        console.log('phone code:',phoneInput,code);
        if(code){
            return getCountry({
                field : 'dialCode',
                value : code,
            })?.name;
        }
    } catch (e) {
        console.log('e:',e);
        return null;
    }
}
export function ValidatePhone(value : string,strict : boolean = false){
    value = (value||'').replace(/\s/g,'');
    if(!value) return false;
    if(PhoneOnlyRequired() && !strict){
        return true;
    }
    if(!value.startsWith('+')){
        return false;
    }

    const phone_regex = getJsonFromMeta('phone_regex',[]);
    if(isArray(phone_regex)){
        const hit = phone_regex.some(function(regex){
            try{
                return (new RegExp(regex)).test(value);
            }catch(e){
                return false;
            }
        });
        if(hit){
            return true;
        }
    }
    if(Validators.isMobilePhone(value,"any",{
        strictMode: true,
    })){
        return true;
    }
    try {
        const util = new PhoneNumberUtil();
        const phoneInput = util.parseAndKeepRawInput(value);
        if (util.isValidNumber(phoneInput)) {
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
}
