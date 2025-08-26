import {FC, useEffect, useMemo} from "react";
import {find as _find,capitalize as _capitalize,startsWith} from "lodash-es";
import {Input} from "../../../components/Input.tsx";
import {CircleHelp} from "lucide-react";
import {Tooltip} from "@components/fragments/Tooltip.tsx";
import {
    NewRegionSelector,
    NewStateSelector,
    RegionSelector,
    StateSelector
} from "../../../components/RegionSelector.tsx";
import {FormItem} from "@components/fragments/FormItem.tsx";
import {useWatch} from "rc-field-form";
import {FormContext, useCurrentForm} from "../../../../container/FormContext.ts";
import useSWR from "swr";
import Validators from "validator";
import {startsWith as _startsWith } from "lodash-es";
import {StepBlock} from "@components/frames/StepBlock.tsx";
import {PhoneInput} from "@components/ui/PhoneInput.tsx";

export type AddressFormProps = {
    title: string;
    prefix?: string[];
};

export const AddressForm: FC<AddressFormProps> = (props) => {
    const {title, prefix = [],} = props;
    const {form:formInstance,onValuesChanged} = FormContext.use()//useCurrentForm();
    useWatch([...prefix, 'region_code'], {
        form: formInstance,
        preserve: true,
    });
    const region_id = formInstance.getFieldValue([...prefix, 'region_code']);
    const {data: Regions,isLoading} = useSWR('/a/s/api/zones');
    const [zones, hitRegion] = useMemo(() => {
        const hit = _find(Regions, (r) => {
            return (r.code) === region_id;
        });
        return [hit?.children || [], hit] as const;
    }, [region_id, Regions]);
    useEffect(() => {
        if (!region_id) {
            let firstRegion = Regions?.[0];
            const countryCode = formInstance.getFieldValue('countryCode');
            if(!!countryCode){
                firstRegion  = _find(Regions, (r) => {
                    return (r.code) === countryCode;
                });
            }
            if (!!(firstRegion?.code)) {
                formInstance.setFields([
                    {
                        name: [...prefix, 'region_code'],
                        value: firstRegion?.code,
                    }, {
                        name: [...prefix, 'region'],
                        value: firstRegion,
                    }
                ]);
                onValuesChanged?.({
                    shipping_address : {
                        region_code : firstRegion?.code,
                        region: firstRegion,
                    }
                });
            }
        }
    }, [region_id, Regions]);
    useEffect(() => {
        const region = formInstance.getFieldValue([...prefix,'region']);
        if(!region?.data){
            formInstance.setFieldValue([...prefix,'region'],hitRegion);
        }
    }, [hitRegion]);
    const firstZone = zones?.[0];
    useEffect(() => {
        if(isLoading) return;
        if (!region_id) return;
        const current = formInstance?.getFieldValue([...prefix, 'state_code']);
        if (!firstZone?.code  || !current || !_find(zones, (z) => {
            return z.code === current;
        })) {
            formInstance?.setFields([{
                name: [...prefix, 'state_code'],
                value: firstZone?.code  || null,
            }, {
                name: [...prefix, 'state'],
                value: firstZone || null,
            }])
        }
    }, [region_id, firstZone?.id,isLoading]);
    const phonePrefix = hitRegion?.data?.phoneNumberPrefix;
    const zipHolder = hitRegion?.data?.postalCodeExample;
    const label = _capitalize(title || '');
    return <StepBlock className={'flex flex-col space-y-4'} label={`${label} address`} name={`${label}-address`}>
        <div className={'grid grid-cols-6 gap-y-3 gap-x-2'}>
            <FormItem name={[...prefix, 'first_name']} rules={[{
                // required : true,
                // message  : 'Enter a first name'
            }]}>
                <Input placeholder={'First Name (optional)'}
                       autoComplete={'give-name'}
                       className={'md:col-span-3 col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'last_name']} rules={[{
                required: true,
                message: 'Enter a last name',
            }]}>
                <Input placeholder={'Last Name'}
                       autoComplete={'family-name'}
                       className={'md:col-span-3 col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'line1']} rules={[{
                async validator(rule, value) {
                    if (value.length < 4) {
                        throw new Error('Please enter 4-200 characters to Automatically retrieve addresses.');
                    }
                },
                message: 'Please enter 4-200 characters to Automatically retrieve addresses.'
            }]}>
                <Input placeholder={'Address'}
                       autoComplete={'address-line1'}
                       className={'col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'line2']}>
                <Input placeholder={'Apartment, suite, etc. (optional)'}
                       autoComplete={'address-lin2'}
                       className={'col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'city']} rules={[{
                required: true,
                message: 'Enter a city'
            }]}>
                <Input placeholder={'City'}
                       autoComplete={'address-level2'}
                       className={'col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'region']} preserve={true}>
                <div className={'hidden'}/>
            </FormItem>
            <FormItem name={[...prefix,'region_code']} >
                <NewRegionSelector
                    autoComplete={'country'}
                    // field={'region'}
                    placeholder={'Country/Region'}
                    className={(zones?.length > 0) ? `md:col-span-2 col-span-6` : 'md:col-span-3 col-span-6'}
                />
            </FormItem>
            {/*<FormItem name={[...prefix, 'state']} preserve={true}>*/}
            {/*    <div className={'hidden'}/>*/}
            {/*</FormItem>*/}
            <FormItem name={[...prefix,'state_code']}>
                <NewStateSelector
                    autoComplete={'address-level1'}
                    // field={'state'}
                    zones={zones}
                    placeholder={'Province/State'}
                    className={`md:col-span-2 col-span-6`}
                />
            </FormItem>
            <FormItem name={[...prefix, 'zip']} rules={[{
                required: true,
                message: 'Enter a ZIP / postal code',
            }]}>
                <Input placeholder={zipHolder ? `Zip Code Like ${zipHolder}` : 'Zip Code'}
                       autoComplete={'postal-code'}
                       className={(zones?.length > 0) ? 'md:col-span-2 col-span-6' : 'md:col-span-3 col-span-6'}/>
            </FormItem>
            <FormItem name={[...prefix, 'phone']} rules={[{
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
            }]}>
                <PhoneInput placeholder={`Phone (For shipping updates) ${phonePrefix?'+' + phonePrefix:''}`} className={'col-span-6'}
                       countryCode={hitRegion?.code}
                       autoComplete={'tel'}
                       // prefix={phonePrefix ? <div>+{phonePrefix}</div> : undefined}
                       suffix={<Tooltip icon={<CircleHelp size={16}/>}>
                           <p>In case we need to contact</p>
                           <p>you for delivery</p>
                       </Tooltip>}

                />

            </FormItem>
        </div>
    </StepBlock>
};
