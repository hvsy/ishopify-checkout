import {FC, useEffect, useMemo, useState} from "react";
import {get,uniq} from "lodash-es";
import {useCurrentForm} from "../container/FormContext.ts";
import Form from "rc-field-form";
import useSWR from "swr";
import {getIntFromMeta, getMetaContent} from "@lib/metaHelper.ts";

export type ZipSuggestProps = {
    region : any,
    prefix : string[];
};

export const ZipSuggest: FC<ZipSuggestProps> = (props) => {
    const {region,prefix} = props;
    if(!region) return null;
    // if(!(['US'].includes(region.code.toUpperCase()))) return null;
    return <ZipSuggestContainer prefix={prefix} region={region}/>;
};

export const ZipSuggestContainer : FC<any> = (props) => {
    const {prefix,region} = props;
    const form = useCurrentForm();
    useEffect(() => {
        if(!region?.code)return;
        if (['US','UM'].includes(region.code)) {
            import("./census.ts").then().catch();
        } else {
            import("./nominatim.ts").then().catch();
        }
    }, [region.code]);
    const data = Form.useWatch((values)=>{
        const v = get(values,prefix.join('.'));
        return {
            state_code : v.state_code,
            line1 : v.line1,
            line2 : v.line2,
            zip : v.zip,
            city : v.city,
        }
    },{
        form
    });
    import.meta.env.DEV && console.log('zip suggest data:',data,region)
    if(!!data?.zip) return null;
    if(!!region?.children?.length && !data?.state_code){
        import.meta.env.DEV && console.log('zip suggest no state return:',data,region)
        return null;
    }
    if(!data?.city) return null;
    if(uniq([data?.line1,data?.line2].filter(Boolean)).join(' ').trim().length <= 5) return null;
    return <ZipSuggestInner
                            region={region}
                            address={data}
                            onFill={(suggest : string) => {
                                form.setFieldValue([...prefix,'zip'],suggest);
                                form.validateFields([[...prefix,'zip']])
                            }}
    />;
}
export function useDelayValue<T>(value : T, delay : number) {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
const delay =getIntFromMeta('zip_suggest_delay',1000);
export const ZipSuggestInner : FC<any> = (props)=>{
    const {address,region,onFill} = props;
    const key  =[region?.code,address?.state_code,
        address?.city,
        address?.line1,address?.line2].filter(Boolean).join(',');
    const debounceKey =  useDelayValue(key,delay);
    const {data : suggest} = useSWR(debounceKey, () => {
        const module= ['US','UM'].includes(region.code)? import("./census.ts") : import("./nominatim.ts");
        return module.then((m) => {
            const zero_state = !region?.children?.length;
            const state = address?.state_code ? region.children?.find((s : any) => {
                return s.code === address?.state_code;
            }) : null;
            import.meta.env.DEV && console.log('swr:',address,zero_state,state,!zero_state && !state);
            if(!zero_state && !state) return null;
            return m.default({
                ...address,
                state:state?.en_name,
                region: region.en_name,
                region_code : region.code,
            }).then((matches) => {
                return (matches||[]).filter((m) => {
                    import.meta.env.DEV && console.log('suggest match:',m);
                    if(!m.address.state_code && !m.address.state && !address.state_code) return true;
                    if(m.address.state_code){
                        return m.address.state_code === address.state_code;
                    }else if(m.address.state){
                        return m.address.state === address.state;
                    }
                })?.[0].address?.zip;
            });
        })
    },{

    })
    if(!suggest) return null;
    return <div className={'flex flex-row space-x-1 items-baseline p-1'}>
        <span>Suggest Code :</span>
        <span className={'font-bold black cursor-pointer underline text-sm'} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFill?.(suggest);
        }}>
            {suggest}
        </span>
    </div>
}
