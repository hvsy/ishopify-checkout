import {FC, memo, ReactNode, useMemo, useRef} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select.tsx";
import {
    CountryData,
    defaultCountries,
    FlagImage,
    getCountry,
    parseCountry,
    ParsedCountry
} from "react-international-phone";
import {Features} from "@lib/flags.ts";
import {AllFlags, AllZones} from "../../assets/zones.ts";
import {find, sortBy} from "lodash-es";
import {getGlobalPath} from "../../shopify/lib/globalSettings.ts";

export type CountriesSelectorProps = {
    iso2 ?: string;
    onSelect ?: (country ?: ParsedCountry)=>void;
};

const top = getGlobalPath("profile.countries",[]) as string[];
const compact=Features.includes('phone:countries:compact');
console.log('top countries:',top);
export const CountriesSelector: FC<CountriesSelectorProps> = memo((props) => {
    const {iso2,onSelect} = props;
    const country = useMemo(() => {
        if(!iso2) return null;
        return getCountry({
            field : 'iso2',
            value : iso2,
            countries : defaultCountries,
        })
    },[iso2]);
    const native = Features.includes("phone:countries:native");
    const ref = useRef<HTMLSelectElement>(null);
    const children = useMemo(() => {
        let after = defaultCountries;
        if(compact){
            after = after.filter((c)=>{
                return !!find(AllZones, (z) => {
                    return z.code?.toLowerCase() === parseCountry(c)?.iso2?.toLowerCase();
                })
            });
        }
        let all : any[] = [];
        if(top && top.length){
            all = (top.map((code) => {
                return find(defaultCountries, (c) => {
                    return code === parseCountry(c)?.iso2?.toUpperCase();
                })
            }));
            all.push(null);
        }
        return [...all,...after].map((c) => {
            if(!c) return c;
            const country = parseCountry(c);
            let emoji = AllFlags[country.iso2?.toUpperCase()] || null;
            let prefix = emoji ? emoji + ' ':'';
            const label = `${prefix}${country.name} +${country.dialCode}`;
            const value = country.iso2;
            if(native){
                return {
                    label,
                    value ,
                }
            }
            return <SelectItem key={country.iso2} value={value} className={'justify-start text-xl'}>
                <div className={'flex flex-row space-x-4 items-center justify-start'}>
                    <FlagImage iso2={country.iso2} size={30}/>
                    <div>{label}</div>
                </div>
            </SelectItem>
        });
    },[native]);
    const flag = useMemo(() => {
        return iso2 ? <div className={'flex flex-row items-center space-x-1 mr-0 sm:mr-2 sm:space-x-3 overflow-hidden'}>
            <FlagImage iso2={iso2} size={30}/>
            <div>{country?.dialCode ? '+' + country.dialCode : ''}</div>
        </div>: null
    },[iso2]);
    if(native){
        return <div className={'flex flex-row space-x relative overflow-hidden mx-2 min-w-20 flex-1'}>
            <div className={'z-50 absolute inset-0 pointer-events-none flex flex-col justify-center'} onClick={() => {
                if(!ref.current) return;
            }}>
                {flag}
            </div>
            <select ref={ref} className={'absolute z-0 inset-0 appearance-none'} value={iso2} onChange={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSelect?.(getCountry({
                    field : 'iso2',
                    value : e.target.value,
                    countries : defaultCountries,
                }));
            }}>
                {children.map((child : any,i) => {
                    if(child === null)
                        return <option disabled key={'empty'}>------------------</option>
                    return <option value={child.value} key={child.value + `_${i}`}>{child.label}</option>
                })}
            </select>
            <div className={'absolute z-10 -inset-1 pointer-events-none bg-white'}></div>
        </div>
    }

    return <Select value={iso2} onValueChange={(iso) => {
        onSelect?.(getCountry({
            field : 'iso2',
            value : iso,
            countries : defaultCountries,
        }));
    }}>
        <SelectTrigger className={'w-auto border-none p-0 m-0 px-0 focus:ring-0 overflow-hidden'}>
            {flag}
        </SelectTrigger>
        <SelectContent>
            {children as ReactNode}
        </SelectContent>
    </Select>;
});
