import React, {FC, useMemo, useState} from "react";
import {Input} from "../../components/Input.tsx";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {api} from "@lib/api.ts";
import {CheckoutContainer} from "../../../container/CheckoutContext.ts";
import {TagIcon, XIcon} from "lucide-react";
import {useQueryState} from "@hooks/useQueryState.tsx";
import {mutate} from "swr";
import {Preloader} from "@lib/Cache.ts";
import {get as _get,isString as _isString} from "lodash-es";

export type CouponFormProps = {};

export const CouponForm: FC<CouponFormProps> = (props) => {
    const {} = props;
    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<any>(false);
    const checkout = CheckoutContainer.use();
    const discount = checkout?.discount;
    const [searchDiscountCode, setDiscountCode] = useQueryState('discount_code');
    const url = useMemo(() => {
        return `/checkouts/${checkout?.token}`;
    },[checkout?.token]);
    return <div className={'py-3 space-y-3 flex-shrink-0 flex flex-col items-stretch'}>
        <div className={'text-sm'}>
            Sign in Coupon code applied will be stored on your account
        </div>
        <div className={'flex flex-row items-center space-x-2'}>
            <Input size={'sm'} placeholder={'Coupon code'}
                   className={'flex-1'} float={false}
                   value={code}
                   onChange={(e) => {
                       setCode(e.target.value);
                   }}
            />
            <AsyncButton onClick={async () => {

                if (!code) return;
                setError(false);
                try {
                    const res = await api({
                        method: 'put',
                        url : `${url}/discount_code`,
                        data: {
                            discount_code: code,
                        },
                    });
                    await mutate(url, (before : any) => {
                        const final = {
                            ...before,
                            ...res,
                        };
                        Preloader.replace(url,final);
                        return final;
                    });
                    setCode('');
                } catch (e) {
                    if(_get(e,'response.status') === 422) {
                        setError(_get(e,'response.data.message',true));
                    }else {
                        setError(true);
                    }
                }
            }}>
                Apply
            </AsyncButton>
        </div>
        {discount && <div className={'flex flex-col items-start'}>
            <div className={'flex flex-row items-center py-1 px-1 border bg-gray-100 border-gray-200 space-x-2 text-sm'}>
                <TagIcon className={'size-4 scale-x-[-1]'}/>
                <div>
                    {discount.code || discount.title}
                </div>
                {discount.code && <AsyncButton
                    className={'bg-transparent text-black py-0 px-0 h-auto hover:bg-transparent'} onClick={async () => {
                    // const search = searchParams.get('discount_code');
                    const res = await api({
                        method : "put",
                        url : `${url}/discount_code`,
                        data: {
                            discount_code: null
                        }
                    });
                    await mutate(url, (before : any) => {
                        const final = {
                            ...before,
                            ...res,
                        };
                        Preloader.replace(url,final);
                        return final;
                    });
                    // set(cart);
                    if(!res.discount_code && searchDiscountCode === discount?.code){
                        setDiscountCode(null);
                    }
                }}>
                    <XIcon className={'size-4 cursor-pointer'}/>
                </AsyncButton>}
            </div>
        </div>}
        {error && <div className={'text-red-400'}>
            {_isString(error) ? error:
            'This code did not match any active gift card or discount. Was it entered correctly?' }
        </div>}
    </div>;
};
