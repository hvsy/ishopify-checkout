import React, {FC, useState} from "react";
import {Input} from "../../page/components/Input.tsx";
import {AsyncButton} from "../fragments/AsyncButton.tsx";
import {get as _get, isString as _isString} from "lodash-es";
import {TagIcon, XIcon} from "lucide-react";

export type CouponFormFrameProps = {
    onClick ?: (code : string,codes : string[])=>Promise<any>;
    onRemove ?: (discount : any,codes : string[])=>Promise<any>;
    discounts ?: any[];
};

export const CouponFormFrame: FC<CouponFormFrameProps> = (props) => {
    const {onClick,discounts,onRemove} = props;
    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<any>(false);
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
                    await onClick?.(code,(discounts||[]).map(i=>i.code))
                    setCode('');
                } catch (e) {
                    setError(e);
                }
            }}>
                Apply
            </AsyncButton>
        </div>
        {(!!discounts?.length) && <div className={'flex flex-row space-x-1 items-start'}>
            {discounts.map((discount : any) => {
                return <div key={discount.code} className={'flex flex-row items-center py-1 px-1 border bg-gray-100 border-gray-200 space-x-2 text-sm'}>
                    <TagIcon className={'size-4 scale-x-[-1]'}/>
                    <div>
                        {discount.code || discount.title}
                    </div>
                    {discount.code && <AsyncButton
                        className={'bg-transparent text-black py-0 px-0 h-auto hover:bg-transparent'} onClick={async () => {
                        // const search = searchParams.get('discount_code');
                        return onRemove?.(discount.code,(discounts||[]).map(i=>i.code));
                    }}>
                        <XIcon className={'size-4 cursor-pointer'}/>
                    </AsyncButton>}
                </div>;
            })}
        </div>}
        {error && <div className={'text-red-400'}>
            {_isString(error) ? error:
                'This code did not match any active gift card or discount. Was it entered correctly?' }
        </div>}
    </div>;
};
