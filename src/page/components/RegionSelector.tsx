import {FC, } from "react";


import {find as _find} from "lodash-es";
import {Selector} from "./Selector.tsx";
import useSWR from "swr";

export type RegionSelectorProps = {
    value?: any,
    onChange?: (value: any) => void;
    placeholder?: string;
    className?: string;
    field: string;
    autocomplete ?: string;
};

export const NewRegionSelector : FC<any> = (props) => {
    const {data: zones} = useSWR('/a/s/api/zones');
    return <Selector {...props}>
        <option hidden disabled value={''}>&nbsp;</option>
        {(zones || []).map((zone: any) => {
            return <option value={zone.code} key={zone.code}>
                {zone.flag} {zone.en_name}
            </option>
        })}
    </Selector>;
};
export const NewStateSelector : FC<any> = (props)=>{
    const {zones,...others} = props;
    if ((zones || []).length === 0) return null;
    return <Selector {...others}>
        <option hidden disabled value={''}>&nbsp;</option>
        {(zones || []).map((zone: any) => {
            return <option key={zone.id} value={zone.code}>{zone.en_name}</option>
        })}
    </Selector>;
}

export const RegionSelector: FC<RegionSelectorProps> = (props) => {
    const {placeholder, autocomplete,field, className, value, onChange} = props;
    const {data: zones} = useSWR('/a/s/api/zones');
    const id = field + "_code";
    return <Selector placeholder={placeholder} className={className}
                     autoComplete={autocomplete}
                     value={value?.[id]} onChange={(zone_code) => {
        const after = {
            ...value,
            [field]: _find(zones, (z) => {
                return z.code === zone_code;
            }),
            [id]: zone_code,
        };
        // console.log('region after:',after,zone_code);
        onChange?.(after);
    }}>
        {(zones || []).map((zone: any) => {
            return <option value={zone.code} key={zone.code}>
                {zone.flag} {zone.en_name}
            </option>
        })}
    </Selector>;
};

export const StateSelector: FC<RegionSelectorProps & { zones?: any[] }> = (props) => {
    const {placeholder, field, className, value, onChange, zones,autocomplete} = props;
    if ((zones || []).length === 0) return null;
    const id = field + '_code';
    return <Selector placeholder={placeholder}
                     autoComplete={autocomplete}
                     className={className}
                     value={value?.[id]} onChange={(zone_code) => {
        const after = {
            ...value,
            [field]: _find(zones, (z) => {
                return z.code === zone_code;
            }),
            [id]: zone_code,
        };
        onChange?.(after);
    }}>
        {(zones || []).map((zone: any) => {
            return <option key={zone.id} value={zone.code}>{zone.en_name}</option>
        })}
    </Selector>;
};
