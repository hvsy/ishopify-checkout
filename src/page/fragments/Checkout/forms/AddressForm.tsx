import {FC, useEffect, useMemo, useRef} from "react";
import {find as _find,capitalize as _capitalize,startsWith} from "lodash-es";
import {Input} from "../../../components/Input.tsx";
import {CircleHelp} from "lucide-react";
import {Tooltip} from "@components/fragments/Tooltip.tsx";
import {
    NewRegionSelector,
    NewStateSelector,
} from "../../../components/RegionSelector.tsx";
import {FormItem} from "@components/fragments/FormItem.tsx";
import {useWatch} from "rc-field-form";
import {FormContext, useCurrentForm,} from "../../../../container/FormContext.ts";
import useSWR from "swr";
import Validators from "validator";
import {StepBlock} from "@components/frames/StepBlock.tsx";
import {PhoneInput} from "@components/ui/PhoneInput.tsx";
import {UNSAFE_useRouteId} from "react-router-dom";
import {useEventCallback} from "usehooks-ts";

export type AddressFormProps = {
    title?: string;
    titleClassName ?: string;
    prefix?: string[];
    hidden_fields ?: ('phone'|'zip')[];
    api ?: string;
    preserve ?: boolean;
    zones ?: any[];
};



export const StateCodeFormItem : FC<any> = (props) => {
    const {name,zones,className,autoComplete,preserve = false} = props;
    const approve = UNSAFE_useRouteId() === 'approve';
    const form = useCurrentForm();
    useEffect(() => {
        if(approve){
            form.validateFields([
                name
            ],{

            })
        }
    }, [approve]);
    if(!zones?.length) return null;
    return <FormItem name={name} rules={[{
        required :true,
        message : 'Select a state / province',
    }]} preserve={preserve}>
        <NewStateSelector
            autoComplete={autoComplete}
            // field={'state'}
            zones={zones}
            placeholder={'Province/State'}
            className={className}
        />
    </FormItem>
};
export const AddressForm: FC<AddressFormProps> = (props) => {
    const {preserve = false, title,titleClassName,hidden_fields = [], prefix = [],api = '/a/s/api/zones'} = props;
    const pf = prefix.join('.').replace('_address','');
    const {form:formInstance,onValuesChanged} = FormContext.use()//useCurrentForm();
    const {data: Regions,isLoading} = useSWR(api);
    useWatch([...prefix, 'region_code'], {
        form: formInstance,
        preserve,
    });
    const region_code = formInstance.getFieldValue([...prefix, 'region_code']);
    const [zones, hitRegion] = useMemo(() => {
        const hit = _find(Regions, (r) => {
            return (r.code) === region_code;
        });
        return [hit?.children || [], hit] as const;
    }, [region_code, Regions]);
    const zonesRef = useRef<any>(null);
    zonesRef.current = zones;
    const setRegion = useEventCallback((region : any)=>{
       if(!!region?.code) {
           formInstance.setFields([
               {
                   name: [...prefix, 'region_code'],
                   value: region?.code,
               }, {
                   name: [...prefix, 'region'],
                   value: region,
               }
           ]);
           onValuesChanged?.({
               [prefix.join('.')]: {
                   region_code : region?.code,
                   region: region,
               }
           });
       }
    });
    const clearRegion = useEventCallback(() => {
        formInstance.setFields([
            {
                name: [...prefix, 'region_code'],
                value: null,
            }, {
                name: [...prefix, 'region'],
                value: null,
            }
        ]);
        onValuesChanged?.({
            [prefix.join('.')]: {
                region_code : null,
                region: null,
            }
        });
    });
    useEffect(() => {
        if(!Regions?.length) return;
        if (!region_code) {
            let firstRegion = Regions?.[0];
            const countryCode = formInstance.getFieldValue('countryCode');
            if(!!countryCode){
                firstRegion  = _find(Regions, (r) => {
                    return (r.code) === countryCode;
                });
            }
            setRegion(firstRegion);
            // if (!!(firstRegion?.code)) {
            //
            // }
        }else{
            let hit_region = _find(Regions, (r) => {
                return (r.code) === region_code;
            });
            if(!hit_region){
                // clearRegion();
                setRegion(Regions?.[0]);
            }
        }
    }, [region_code, Regions]);
    useEffect(() => {
        const region = formInstance.getFieldValue([...prefix,'region']);
        if(!region?.data){
            formInstance.setFieldValue([...prefix,'region'],hitRegion);
        }
    }, [hitRegion]);
    const firstZone = zones?.[0];
    useEffect(() => {
        if(isLoading) return;
        if (!region_code) return;
        const current = formInstance?.getFieldValue([...prefix, 'state_code']);
        if(!current || !_find(zonesRef.current||[], (z) => {
                return z.code === current;
        })){
                formInstance?.setFields([{
                    name: [...prefix, 'state_code'],
                    // value: firstZone?.code  || null,
                    value : null,
                }, {
                    name: [...prefix, 'state'],
                    // value: firstZone || null,
                    value : null,
                }])
        }
    }, [region_code, firstZone?.id,isLoading]);
    const phonePrefix = hitRegion?.data?.phoneNumberPrefix;
    const zipHolder = hitRegion?.data?.postalCodeExample;
    const label = _capitalize(title || '');
    const postalCodeRequired = !!hitRegion?.data?.postalCodeRequired && !(hidden_fields||[]).includes('zip');
    let colSpan = 3;
    if(!zones?.length){
        colSpan--;
    }
    if(!postalCodeRequired){
        colSpan--;
    }
    const colSpanClass = ['md:col-span-6','md:col-span-3' ,'md:col-span-2'][colSpan-1];
    return <StepBlock className={'flex flex-col space-y-4'} labelClassName={titleClassName} label={`${label} address`} name={`${label}-address`}>
        <div className={'grid grid-cols-6 gap-y-3 gap-x-2'}>
            <FormItem name={[...prefix, 'region']} preserve={true}>
                <div className={'hidden'}/>
            </FormItem>
            <FormItem name={[...prefix,'region_code']} preserve={true}>
                <NewRegionSelector
                    zones={Regions}
                    autoComplete={`${pf} country`}
                    // field={'region'}
                    placeholder={'Country/Region'}
                    className={`col-span-6`}
                />
            </FormItem>
            <FormItem name={[...prefix, 'first_name']} rules={[{
                // required : true,
                // message  : 'Enter a first name'
            }]} normalize={(value,) => {
                return (value||'').replace(/\d/ig,'');
            }} preserve={preserve}>
                <Input placeholder={'First Name (optional)'}
                       autoComplete={`${pf} given-name`}
                       className={'md:col-span-3 col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'last_name']} rules={[{
                required: true,
                message: 'Enter a last name',
            }]} normalize={(value, ) => {
                return (value||'').replace(/\d/ig,'');
            }} preserve={preserve}>
                <Input placeholder={'Last Name'}
                       autoComplete={`${pf} family-name`}
                       className={'md:col-span-3 col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'line1']} rules={[{
                async validator(rule, value) {
                    if (value.length < 4) {
                        throw new Error('Please enter 4-200 characters to Automatically retrieve addresses.');
                    }
                },
                message: 'Please enter 4-200 characters to Automatically retrieve addresses.'
            }]} preserve={preserve}>
                <Input placeholder={'Address'}
                       autoComplete={`${pf} address-line1`}
                       className={'col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'line2']} preserve={preserve}>
                <Input placeholder={'Apartment, suite, etc. (optional)'}
                       autoComplete={`${pf} address-line2`}
                       className={'col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'city']} rules={[{
                required: true,
                message: 'Enter a city'
            }]} preserve={preserve}>
                <Input placeholder={'City'}
                       autoComplete={`${pf} address-level2`}
                       className={`${colSpanClass} col-span-6`}/>
            </FormItem>
            {zones.length > 0 && <StateCodeFormItem
                autoComplete={`${pf} address-level1`}
                name={[...prefix,'state_code']}
                className={`${colSpanClass} col-span-6`}
                zones={zones}
                preserve={true}
            />}
            {postalCodeRequired  && <FormItem name={[...prefix, 'zip']} rules={[{
                required: true,
                message: 'Enter a ZIP / postal code',
            }]} preserve={preserve}>
                <Input placeholder={zipHolder ? `Postal Code Like ${zipHolder}` : 'Postal Code'}
                       autoComplete={`${pf} postal-code`}
                       className={`${colSpanClass} col-span-6`}/>
            </FormItem>}
            {!(hidden_fields||[]).includes('phone') && <FormItem name={[...prefix, 'phone']} rules={[{
                required: true,
                async validator(rules, value) {
                    if(!value){
                        throw new Error("Enter a valid phone number");
                    }
                    if(!startsWith(value,'+')){
                        throw new Error("please input the country calling code , for example : +" + phonePrefix);
                    }
                    // let full = value;
                    // if(!_startsWith(full,'+')){
                    //     full = `+${phonePrefix}${full}`;
                    // }
                    // console.log('full:',full);
                    if (!Validators.isMobilePhone(value,"any",{
                        strictMode : true,
                    })) {
                        throw new Error('Enter a valid phone number');
                    }
                },
                // message: 'Enter a valid phone number',
            }]} preserve={preserve}>
               <PhoneInput placeholder={`Phone (For shipping updates) ${phonePrefix?'+' + phonePrefix:''}`} className={'col-span-6'}
                       countryCode={hitRegion?.code}
                       autoComplete={`${pf} tel`}
                       // prefix={phonePrefix ? <div>+{phonePrefix}</div> : undefined}
                       suffix={<Tooltip icon={<CircleHelp size={16}/>}>
                           <p>In case we need to contact</p>
                           <p>you for delivery</p>
                       </Tooltip>}

                />
            </FormItem>}
        </div>
    </StepBlock>
};
