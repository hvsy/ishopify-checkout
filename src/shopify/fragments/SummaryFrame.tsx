import React, {FC, Fragment, ReactNode} from "react";
import {TagIcon, TagsIcon} from "lucide-react";
import {useMoneyFormat} from "../context/ShopifyContext.ts";
import {Skeleton} from "@components/ui/Skeleton.tsx";
import {isObject} from "lodash-es";

export type SummaryFrameProps = {
    subtotal : Shopify.Money,
    total : Shopify.Money;
    total_saved ?: Shopify.Money;
    total_quantity : number;
    discount_codes : any[];
    shipping_discounts : any[];
    renderShipping ?: ()=>ReactNode;
    loading ?: boolean;

};

export const SummaryFrame: FC<SummaryFrameProps> = (props) => {
    const {subtotal,total_saved,total_quantity,discount_codes,
        total,
        renderShipping,
        shipping_discounts,
        loading = false,
    } = props;
    const format = useMoneyFormat();
    if(import.meta.env.VITE_SKELETON){
        return <div className={'grid grid-cols-2 gap-y-2 text-sm pt-2 justify-between'}>
            <Skeleton className={'min-w-12 min-h-5 max-w-12'}/>
            <div className={'flex flex-row justify-end'}>
                <Skeleton className={'min-w-12 min-h-5 max-w-12'}/>
            </div>
            <Skeleton className={'min-w-12 min-h-5 max-w-12'}/>
            <div className={'flex flex-row justify-end'}>
                <Skeleton className={'min-w-12 min-h-5 max-w-12'}/>
            </div>
            <Skeleton className={'min-w-12 min-h-5 max-w-12'}/>
            <div className={'flex flex-row justify-end'}>
                <Skeleton className={'min-w-12 min-h-5 max-w-12'}/>
            </div>
        </div>
    }
    return <div className={'grid grid-cols-2 gap-y-2 text-sm py-2'}>
        <div className={'flex flex-row items-center'}>
            Subtotal · {loading ? <Skeleton className={'mx-1 min-w-4 min-h-5 max-h-5'}/>:(total_quantity || 0)} items
        </div>
        <div className={'text-right'}>
            {loading ? <Skeleton className={'rounded-full ml-auto min-w-4 max-w-12 min-h-5 max-h-5'}/> : format(subtotal)}
        </div>
        {discount_codes.length > 0 && <div className={'flex flex-col space-y-2 col-span-2'}>
            <div className={'flex flex-col items-stretch space-y-2'}>
                <div>
                    Order discount
                </div>
                <div className={'grid grid-cols-2'}>
                    {(discount_codes.map((code: any) => {
                        // 兼容两种入参：完整 MoneyV2（{amount,currencyCode}）或裸 number /
                        // 缺 currencyCode 的 {amount}。后者用总价的 currencyCode 兜底，
                        // 否则 useMoneyFormat 因缺 currencyCode 返回 undefined，折扣金额不显示。
                        const raw = code.amount;
                        const rawObj = isObject(raw) ? raw as Record<string, any> : null;
                        const value = (rawObj && rawObj.currencyCode)
                            ? rawObj
                            : {
                                amount: rawObj ? rawObj.amount : raw,
                                currencyCode: total?.currencyCode || '',
                            };
                        return <Fragment key={code.code}>
                            <div className={'flex flex-row items-center space-x-2 text-gray-500'}>
                                <TagIcon className={'size-4 scale-x-[-1]'}/>
                                <span>{code.code}</span>
                            </div>
                            <div className={'flex flex-row justify-end'}>
                                -{format(value)}
                            </div>
                        </Fragment>
                    }))}
                </div>
            </div>
        </div>}
        <div className={'flex flex-col space-y-2'}>
            <div>
                Shipping
            </div>
            {(!!shipping_discounts?.length) &&
                <div className={'text-gray-500 flex flex-row items-center space-x-1'}>
                    <TagIcon className={'size-4 scale-x-[-1]'}/>
                    <span className={'uppercase'}>
                    {shipping_discounts.map((c: any) => c.title || c.code).join(' ')}
                </span>
                </div>}
        </div>
        <div className={'flex flex-row justify-end'}>
            {renderShipping?.()}
        </div>
        <div className={'text-2xl font-bold mt-3'}>
            <div>
                Total
            </div>
        </div>
        <div className={`flex flex-row justify-end ${loading ? `items-center` :'items-baseline'} mt-3`}>
            {loading ?<Skeleton className={'w-16 h-4 rounded-full'} /> :<div className={'flex flex-row items-baseline space-x-2'}>
                <div className={'text-sm text-gray-400'}>
                    {total?.currencyCode || ''}
                </div>
                <div className={'font-bold text-xl'}>
                    {format(total)}
                </div>
            </div>}
        </div>
        {!!total_saved?.amount &&
        <div className={'text-sm font-bold uppercase flex flex-row space-x-2 items-center col-span-2'}>
            <TagsIcon className={'size-4 scale-x-[-1]'}/>
            <span>
                    Total Savings
                </span>
            <span>
                    {format(total_saved)}
                </span>
        </div>}
    </div>;
};
