import {FC, ReactNode} from "react";
import {FlagImage, usePhoneInput} from "react-international-phone";
import {Input} from "../../page/components/Input";

export type PhoneInputProps = {
    countryCode ?: string;
    value ?: string;
    onChange ?: (value : string)=>void;
    placeholder ?: string;
    autoComplete ?: string;
    suffix ?: ReactNode;
    className ?: string;
};


export const PhoneInput: FC<PhoneInputProps> = (props) => {
    const {countryCode,value,suffix,onChange,...others} = props;
    const {inputValue,handlePhoneValueChange,inputRef,country} = usePhoneInput({
        // defaultCountry : countryCode,
        value  : value || '',
        onChange(data){
            onChange?.(data.phone);
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
