import {FC, useEffect} from "react";
import {Price} from "@components/fragments/Price.tsx";
import {RadioGroup} from "../../../../components/RadioGroup.tsx";
import {CheckoutContainer} from "../../../../../container/CheckoutContext.ts";
import {get as _get,find as _find} from "lodash-es";

export type ShippingListProps = {
    lines ?: DB.ShippingLine[];
    value ?: any,onChange ?: (value : any)=>void;
};

export const ShippingList: FC<ShippingListProps> = (props) => {
    const {lines} = props;
    const checkout = CheckoutContainer.use();
    const {value,onChange} = props;
    useEffect(() => {
        const first = _get(lines,'0.id',null);
        if(!first) return;
        if(!value){
            //如果没有设置shipping_line_id,那么选择第一个
            onChange?.(first);
        }else{
            //如果运费已经不存在了.那么重新选择第一个
            const hit = _find(lines, (line) => {
                return line.id === value;
            });
            if(!hit){
                onChange?.(first);
            }
        }
    }, [value,onChange]);
    return <RadioGroup
        valueAttr={'id'}
        items={lines}
        value={value}
        onChange={onChange}
        renderItem={(line, checked, radio) => {
            const price = parseFloat(line.price);
            return <div key={line.id} className={'cursor-pointer select-none flex flex-row flex-1 items-stretch p-3 space-x-3'}>
                <div className={'flex flex-col justify-center'}>
                    {radio}
                </div>
                <div className={'flex flex-row justify-between flex-1'}>
                    <div className={''}>
                        {line.name}
                    </div>
                    <div className={'space-x-2'}>
                            <span className={checkout?.discount?.free_shipping && price !== 0 ? 'line-through text-gray-400 text-sm' : ''}>
                                {price === 0 ? 'Free' :<Price price={line.price}/>}
                            </span>
                        {checkout?.discount?.free_shipping
                            && price !== 0
                            && <span>Free</span>}
                    </div>
                </div>
            </div>
        }}
    />;
};
