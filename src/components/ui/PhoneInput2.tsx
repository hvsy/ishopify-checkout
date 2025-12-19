import {FC, InputHTMLAttributes, ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {usePhoneInput, FlagImage, CountrySelector, getCountry, defaultCountries} from "react-international-phone";
import {Input} from "../../page/components/Input.tsx";
import {CountriesSelector} from "./CountriesSelector.tsx";
import usePrevious from "./usePrevious.tsx";
import {Phone2} from "../Phone2.ts";

export type PhoneInput2Props = {
    countryCode?: string;
    value?: any;
    onChange?: (value: any) => void;
    placeholder?: string;
    autoComplete?: string;
    suffix?: ReactNode;
    className?: string;
    advanced?: boolean;
    disablePrefillDialCode?: boolean;
    onBlur?: InputHTMLAttributes<HTMLInputElement>['onBlur'];
    phonePrefix ?: string;
    children ?: ReactNode;
};

export const PhoneInputInner2: FC<PhoneInput2Props> = (props) => {
    const {children,suffix,className,value,onChange,...others} = props;
    return <Input
        {...others}
        prefixClassName={'bg-transparent p-0 border-none'}
        prefix={children}
        suffix={suffix && <div>{suffix}</div>}
        className={`${className}`}
        elementClassName={'pl-1'}
        suffixClassName={"absolute inset-y-0 right-0 flex flex-col justify-center"}
        value={value}
        onChange={onChange}
    />
};


export const PhoneInput2  :FC<PhoneInput2Props> = (props) => {
    const {
        countryCode,
        children,
        value,  onChange, ...others
    } = props;
    const ValueString=  value ? value + '' :  '';
    const {inputValue,handlePhoneValueChange,inputRef,country,setCountry} = usePhoneInput({
        defaultCountry : countryCode?.toLocaleLowerCase(),
        value  : ValueString,
        disableDialCodePrefill : true,
        disableCountryGuess : false,
        disableDialCodeAndPrefix : true,
        forceDialCode : false,
        disableFormatting : false,
        onChange(data){
            const after =data.phone?.replace(`+${data.country.dialCode}`,'');
            const p2 = new Phone2();
            p2.number = after;
            p2.dialCode = data.country.dialCode;
            if(!p2.number){
                p2.dialCode = '';
                onChange?.(p2)
                return;
            }
            if(!!value && value instanceof Phone2) {
                if(p2.toString() === value.toString()){
                    return;
                }
            }
            if(p2.toString() !==ValueString){
                onChange?.(p2);
            }
        }
    });

    const currentCountry = useRef(country);
    currentCountry.current = country;
    const currentValue = useRef(value);
    currentValue.current = value;
    useEffect(() => {
        if(!countryCode) return;
        const cv = (currentValue.current || '') + '';
        if(!cv || cv === ('+'+currentCountry.current.dialCode)){
            if(currentCountry.current?.iso2 !== countryCode){
                setCountry(countryCode);
            }
        }
    }, [countryCode,]);
    return <PhoneInputInner2  countryCode={countryCode} {...others} value={inputValue} onChange={handlePhoneValueChange}>
        {country?.iso2 ? <CountriesSelector iso2={country.iso2}
                           onSelect={country=> {
                               if(country?.iso2)
                                   setCountry(country?.iso2);
                           }}
        /> : null}
    </PhoneInputInner2>
}
