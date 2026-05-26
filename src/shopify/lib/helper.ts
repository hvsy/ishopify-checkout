import Validators from "validator";
import {getJsonFromMeta} from "@lib/metaHelper.ts";
import {get as _get, isArray, isEmpty} from "lodash-es";
import {PhoneNumberUtil} from 'google-libphonenumber';
import {getCountry} from "react-international-phone";
import {PhoneOnlyRequired} from "./globalSettings.ts";

export function _start(target : string,prefix: string){
    return target.indexOf(prefix) !== 0 ? prefix + target: target;
}

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
    import.meta.env.DEV && console.log("meta config phone regex:",phone_regex);
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

export function object_diff(to : any,from : any, map : any,callback ?: any){
    const final:any = {};
    Object.keys(map).forEach((key) => {
        const fk = map[key];
        if((!to.hasOwnProperty(key) || !to[key]) && !!from[fk]){
            if(!!callback){
                callback(from[fk],key,fk);
            }
            final[key] = from[fk];
        }
    })
    return final;
}

export function summary2Cart(summary: any) {
    const lines = _get(summary, 'lines.edges').map((edge: any) => {
        const node = edge.node;
        const merchandise = node.merchandise;
        const product = merchandise.product;
        return {
            id: merchandise.id.replace(/gid:\/\/shopify\/[^/]+\//ig, ''),
            title: [product.title, merchandise.title].filter(Boolean).join(' '),
            sku: merchandise.sku,
            barcode: merchandise.sku,
            price: merchandise.price,
            cost: node.cost,
            quantity: node.quantity,
        }
    });
    return lines;
}

export function parseSkuCategories(regex : string[],skus : (string|null|undefined)[]){
    return skus.map((sku) => {
        if (!sku || !sku?.trim()) return null;
        if (isEmpty(regex)) return null;
        const segments = sku.split(/[+,\u{FF0B}\u{FF0C}]/u).map((line) => {
            return line.split('*')?.[0];
        });
        return segments?.map((s) => {
            for (let i = 0; i < regex?.length!; ++i) {
                const reg = new RegExp(regex?.[i]!);
                const hit = (s.match(reg));
                if (hit?.[1]) {
                    return hit?.[1] || null;
                }
            }
            return null;
        }).filter(Boolean) as string[];
    }).flat(1).filter(Boolean) as string[];
}
