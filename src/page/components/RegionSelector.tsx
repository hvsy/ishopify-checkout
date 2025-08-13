import {FC, } from "react";


import {find as _find} from "lodash-es";
import {Selector} from "./Selector.tsx";
import useSWR from "swr";

export type RegionSelectorProps = {
    value?: any,
    onChange?: (value: any) => void;
    placeholder?: string;
    className?: string;
    name: string;
};

export const RegionSelector: FC<RegionSelectorProps> = (props) => {
    const {placeholder, name, className, value, onChange} = props;
    const {data: zones} = useSWR('/a/s/api/zones');
    const id = name + "_code";
    return <Selector placeholder={placeholder} className={className}
                     value={value?.[id]} onChange={(zone_code) => {
        const after = {
            ...value,
            [name]: _find(zones, (z) => {
                return z.code === zone_code;
            }),
            [id]: zone_code,
        };
        console.log('region after:',after,zone_code);
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
    const {placeholder, name, className, value, onChange, zones} = props;
    if ((zones || []).length === 0) return null;
    const id = name + '_code';
    return <Selector placeholder={placeholder}
                     className={className}
                     value={value?.[id]} onChange={(zone_code) => {
        const after = {
            ...value,
            [name]: _find(zones, (z) => {
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
