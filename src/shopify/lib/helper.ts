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


export function ValidatePhone(value : string){
    if(!value) return false;
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

    return Validators.isMobilePhone(value,"any",{
        strictMode: true,
    });
}
