import React, {FC, Fragment, ReactNode} from "react";
import {TagIcon, TagsIcon} from "lucide-react";
import {useMoneyFormat} from "../context/ShopifyContext.ts";

export type SummaryFrameProps = {
    subtotal : Shopify.Money,
    total : Shopify.Money;
    total_saved ?: Shopify.Money;
    total_quantity : number;
    discount_codes : any[];
    shipping_discounts : any[];
    renderShipping ?: ()=>ReactNode;

};

export const SummaryFrame: FC<SummaryFrameProps> = (props) => {
    const {subtotal,total_saved,total_quantity,discount_codes,
        total,
        renderShipping,
        shipping_discounts,
    } = props;
    const format = useMoneyFormat();
    return <div className={'grid grid-cols-2 gap-y-2 text-sm pt-2'}>
        <div className={'flex flex-row items-center'}>
            Subtotal · {total_quantity} items
        </div>
        <div className={'text-right'}>
            {format(subtotal)}
        </div>
        {discount_codes.length > 0 && <div className={'flex flex-col space-y-2 col-span-2'}>
            <div className={'flex flex-col items-stretch space-y-2'}>
                <div>
                    Order discount
                </div>
                <div className={'grid grid-cols-2'}>
                    {(discount_codes.map((code: any) => {
                        return <Fragment key={code.code}>
                            <div className={'flex flex-row items-center space-x-2 text-gray-500'}>
                                <TagIcon className={'size-4 scale-x-[-1]'}/>
                                <span>{code.code}</span>
                            </div>
                            <div className={'flex flex-row justify-end'}>
                                -{format({amount: code.amount})}
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
        <div className={'flex flex-row justify-end items-baseline space-x-2 mt-3'}>
            <div className={'text-sm text-gray-400'}>
                {total.currencyCode}
            </div>
            <div className={'font-bold text-xl'}>
                {format(total)}
            </div>
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
