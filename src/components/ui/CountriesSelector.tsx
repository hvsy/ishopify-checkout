import {FC, memo, useMemo} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select.tsx";
import {
    CountryData,
    defaultCountries,
    FlagImage,
    getCountry,
    parseCountry,
    ParsedCountry
} from "react-international-phone";

export type CountriesSelectorProps = {
    iso2 ?: string;
    onSelect ?: (country ?: ParsedCountry)=>void;
};

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
    const children = useMemo(() => {
        return defaultCountries.map((c) => {
            const country = parseCountry(c);
            return <SelectItem key={country.iso2} value={country.iso2} className={'justify-start text-xl'}>
                <div className={'flex flex-row space-x-4 items-center justify-start'}>
                    <FlagImage iso2={country.iso2} size={30}/>
                    <div>
                        {country.name} +{country.dialCode}
                    </div>
                </div>
            </SelectItem>
        });
    },[]);
    const flag = useMemo(() => {
        return iso2 ? <div className={'flex flex-row items-center space-x-1 mr-0 sm:mr-2 sm:space-x-3'}>
            <FlagImage iso2={iso2} size={30}/>
            <div>{country?.dialCode ? '+' + country.dialCode : ''}</div>
        </div>: null
    },[iso2]);
    return <Select value={iso2} onValueChange={(iso) => {
        onSelect?.(getCountry({
            field : 'iso2',
            value : iso,
            countries : defaultCountries,
        }));
    }}>
        <SelectTrigger className={'w-auto border-none p-0 m-0 px-2 focus:ring-0'}>
            {flag}
        </SelectTrigger>
        <SelectContent>
            {children}
        </SelectContent>
    </Select>;
});
