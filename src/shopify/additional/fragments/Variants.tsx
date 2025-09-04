import {FC, ReactNode} from "react";
import {moneyFormat} from "../../lib/helper.ts";
import Big from "big.js";
import {cn} from "@lib/cn.ts";
import {find} from "lodash-es";
import {ProductOptions} from "./ProductOptions.tsx";
import {getVariantBy} from "../../hooks/useVariant.ts";
import {ArrayHelper} from "../../lib/ArrayHelper.ts";
import {useLoaderData} from "react-router-dom";

export type VariantsProps = {
    children ?: ReactNode;
    variants: any[],
    selected : string[];
    options : any[];
    onChange : (selected : string[])=>void;
    className ?: string;
};
export const VariantPrice : FC<any> = (props) => {
    const {variant,quantity} = props;
    const {price} = variant;
    const {amount,currencyCode} = price;
    const data = useLoaderData() as any;
    const {percentage} = data;
    return <div className={'flex flex-row space-x-3'}>
        <div className={'line-through'}>
            {moneyFormat({
                amount  : Big(amount).mul(quantity),
                currencyCode,
            },'code')}
        </div>
        <div className={'flex flex-row space-x-1 text-red-500'}>
            <div className={''}>
                {moneyFormat({
                    amount: Big(amount).mul(quantity).mul(Big(percentage)).div(100).round(2),
                    currencyCode: currencyCode,
                },'code')}
            </div>
            <div>
                ({100 - percentage}% extra discount)
            </div>
        </div>
    </div>;
};
export const Variants: FC<VariantsProps> = (props) => {
    const {className = '',children,variants,selected,options,onChange} = props;
    if(variants.length < 2){
        return children;
    }
    return <div className={`flex flex-col max-w-full overflow-hidden p-1 space-y-4 text-left ${className}`}>
        {children}
        <ProductOptions
            getDisabled={(which: number, value: string) => {
                return !getVariantBy(ArrayHelper.replace(selected, which, value),
                    variants);
            }}
            setSelectedOptions={(callback) => {
                const after = callback(selected);
                onChange(after);
                // const v = getVariantBy() as any;
                // onChange(v?.id || null);
            }}
            selectedOptions={selected}
            options={options}
        />
    </div>
};
