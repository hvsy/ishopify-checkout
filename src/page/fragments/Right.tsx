import React, {FC, ReactNode,} from "react";
import {ChevronDown, LucideTag, ShoppingCart} from "lucide-react";
import {Price} from "@components/fragments/Price.tsx";
import {Collapsible} from "./Collapsible.tsx";
import {isFunction as _isFunction} from "lodash-es";
import Big from "big.js";

export type RightProps = {
    className?: string;
    currency?: DB.Currency;
    children ?: React.ReactNode;
    summary : {
        total : number|string|Big;
        subtotal : number|string|Big;
        discount ?: DB.Discount;
        discount_price ?: number|string|Big;
        insurance ?: number|string|Big|null;
        shipping ?: number|string|Big;
    },
    render ?: ()=>ReactNode;
};

export const Right: FC<RightProps> = (props) => {
    const {className,children,summary,currency,render} = props;
    return <Collapsible
        className={className}
        header={
        <>
            <div className={'flex flex-row items-center space-x-2 text-blue-500'}>
                <div>
                    <ShoppingCart size={18}/>
                </div>
                <div className={'flex flex-row space-x-3 items-center'}>
                    <div className={'text-sm'}>
                        <span className={'group-open:hidden'}>Show order summary</span>
                        <span className={'hidden group-open:inline'}>Hide order summary</span>
                    </div>
                    <div className={'group-open:-rotate-180 duration-300'}>
                        <ChevronDown size={16}/>
                    </div>
                </div>
            </div>
            <div className={'font-bold'}>
                <Price price={Big(summary.total).toString()}/>
            </div>
        </>
    } render={() => {
        return <div
            className={`border-neutral-300
                box-border
                max-h-0
                sm:max-h-fit
                origin-top
                overflow-hidden
                sm:overflow-visible
                sm:!border-b-0
                group-open:overflow-visible
                group-open:border-b
                group-open:max-h-[1000px]
                duration-300
            `} style={{
            transitionProperty: 'max-height'
        }}>
            <div className={'flex flex-col divide-y divide-neutral-200 items-stretch p-6 sm:p-0'}>
                {render ? render() : children}
                <div className={'py-3 text-sm flex-shrink-0 space-y-2 text-default-500'}>
                    {[{
                        label: 'Subtotal',
                        value: <Price price={Big(summary.subtotal).toString()}/>
                    }, {
                        label: <div className={'flex flex-row items-center space-x-2'}>
                            <div>
                                Discount
                            </div>
                            {summary.discount && <div className={'flex flex-row space-x-1 items-center'}>
                                <div className={'-scale-x-100'}>
                                    <LucideTag size={14}/>
                                </div>
                                <div>{summary.discount.code || summary.discount.title}</div>
                            </div>}
                        </div>,
                        value:
                            summary.discount?.free_shipping ? <div>Free Shipping</div> :
                                <div className={'line-through'}>
                                    <Price negativeZero={true} price={
                                        Big(summary.discount_price||0).toString()
                                    }/>
                                </div>

                    },summary.insurance !== undefined && summary.insurance !== null ? {
                        label : 'Shipping insurance',
                        value : ()=> {
                            return <div>
                                <Price price={Big(summary.insurance||0).toString()} />
                            </div>
                        },
                    } : false, {
                        label: 'Shipping',
                        value: () => {
                            if (summary.shipping === undefined) {
                                return "Calculated at next step";
                            }
                            const final = summary.discount?.free_shipping ? 0 : summary.shipping
                            if(parseFloat(final + '') === 0){
                                return 'Free';
                            }
                            return <div className={`${summary.shipping != final ? 'line-through' : ''}`}>
                                <Price price={Big(summary.shipping||0).toString()}/>
                            </div>
                        },
                    },].filter(t=>t !== false && t !== true).map((item, i) => {
                        return <div className={'flex flex-row justify-between'} key={i}>
                            <div className={'text-neutral-500'}>
                                {item.label}
                            </div>
                            <div className={'text-right'}>
                                {_isFunction(item.value) ? item.value() : item.value}
                            </div>
                        </div>
                    })}
                </div>
                <div className={'flex flex-row flex-shrink-0 justify-between items-center pt-3'}>
                    <div>Total</div>
                    <div className={'flex flex-row items-baseline space-x-2'}>
                        <div className={'text-mini text-neutral-500'}>{currency?.code}</div>
                        <div className={'font-bold text-xl'}>
                            <Price price={Big(summary.total)?.toString()}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }} />
};
