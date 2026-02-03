import {uniq} from "lodash-es";

export type GeoAddress = {
    line1 : string,
    line2 ?: string,
    city ?: string;
    state ?: string;
    state_code ?: string;
    region: string;
    region_code : string;
};

export function format_address(address :GeoAddress,include_region : boolean = false){
    const all = [address.line1,
        address.line2,
        address.city,
        address.state,
    ];
    if(include_region && !!address.region){
        all.push(address.region);
    }
    const segments = uniq(all.filter(Boolean));
    let decoded = segments.join(',');
    if(!decoded) return [];
    import.meta.env.DEV && console.log(decoded);
    return encodeURIComponent(decoded);
}
