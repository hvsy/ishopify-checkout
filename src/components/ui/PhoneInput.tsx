import {FC,  InputHTMLAttributes, ReactNode, } from "react";
import {FlagImage, usePhoneInput} from "react-international-phone";
import {Input} from "../../page/components/Input";

export type PhoneInputProps ={
    countryCode ?: string;
    value ?: string;
    onChange ?: (value : string)=>void;
    placeholder ?: string;
    autoComplete ?: string;
    suffix ?: ReactNode;
    className ?: string;
    advanced ?: boolean;
    onBlur ?: InputHTMLAttributes<HTMLInputElement>['onBlur'];
};


export const PhoneInput: FC<PhoneInputProps> = (props) => {
    const {countryCode,advanced =false,value,suffix,onChange,...others} = props;
    const config : any = {

    }
    if(advanced && !!countryCode?.toLocaleLowerCase()){
        config.defaultCountry = countryCode?.toLocaleLowerCase();
    }
    const {inputValue,handlePhoneValueChange,inputRef,country,setCountry} = usePhoneInput({
        ...config,
        // defaultCountry : countryCode?.toLocaleLowerCase(),
        value  : value || '',
        disableDialCodePrefill : !advanced,
        // disableCountryGuess : true,
        onChange(data){
            if(!advanced) {
                onChange?.(data.phone);
            }else{
                const phone = data.phone;
                if(phone === ('+'+data.country.dialCode)){
                    return;
                }else if(phone === '+'){
                    return;
                }else {
                    // if(Validators.isMobilePhone(phone,"any",{
                    //     strictMode : true,
                    // })){
                    onChange?.(phone);
                    // }
                }
            }

        }
    });
    return <Input
        {...others}
        suffixClassName={"absolute inset-y-0 right-0 flex flex-col justify-center"}
        suffix={<div className={'flex  flex-row items-center space-x-2'}>
            {inputValue && country && <div><FlagImage
                className={'size-8'}
                iso2={country.iso2}
                style={{}}
            /></div>}
            {suffix && <div>{suffix}</div>}
        </div>}
        value={inputValue}
        onChange={handlePhoneValueChange}
    />;
};
