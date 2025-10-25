import {FC,} from "react";


import {find as _find, sortBy as _sortBy} from "lodash-es";
import {Selector} from "./Selector.tsx";
import useSWR from "swr";
import {getArrayFromMeta} from "@lib/metaHelper.ts";
import {getGlobalPath} from "../../shopify/lib/globalSettings.ts";


export type RegionSelectorProps = {
    value?: any,
    onChange?: (value: any) => void;
    placeholder?: string;
    className?: string;
    field: string;
    autocomplete?: string;
};

const top = getGlobalPath("profile.countries",[]) as string[];

export const NewRegionSelector: FC<any> = (props) => {
    const {zones = [],value} = props;
    const ups = top.map((code) => {
        const zone = (zones || []).find((zone: any) => {
            return zone.code === code;
        });
        if (zone) {
            return <option value={zone.code} key={zone.code}>
                {zone.flag} {zone.en_name}
            </option>
        }
        return null;
    }).filter(Boolean);
    const hit = !!value && _find(zones, (zone) => {
        return zone.code === value;
    });

    return <Selector {...props}>
        <option hidden disabled value={''}>&nbsp;</option>
        {!hit && !!value &&  <option disabled value={value}>{value}</option> }
        {ups}
        {ups.length > 0 && <option disabled>-------------------------------</option>}
        {_sortBy((zones || []), (zone: any) => {
            return zone.en_name;
        }).map((zone: any) => {
            return <option value={zone.code} key={zone.code}>
                {zone.flag} {zone.en_name}
            </option>
        })}
    </Selector>;
};
export const NewStateSelector: FC<any> = (props) => {
    const {zones, ...others} = props;
    if ((zones || []).length === 0) return null;
    return <Selector {...others}>
        <option hidden disabled value={''}>&nbsp;</option>
        {_sortBy(zones || [],(zone:any)=>zone.en_name).map((zone: any) => {
            return <option key={zone.id} value={zone.code}>{zone.en_name}</option>
        })}
    </Selector>;
}

export const RegionSelector: FC<RegionSelectorProps> = (props) => {
    const {placeholder, autocomplete, field, className, value, onChange} = props;
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
    const {placeholder, field, className, value, onChange, zones, autocomplete} = props;
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
