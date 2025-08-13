import {FC, ReactNode} from "react";
import {Price} from "../fragments/Price.tsx";
import {RadioGroup} from "../../page/components/RadioGroup.tsx";

export type ShippingListFrameProps = {
    lines ?: DB.ShippingLine[];
    value ?: any,onChange ?: (value : any,item : any)=>void;
    renderPrice ?: (line : DB.ShippingLine)=>ReactNode;
    onSelectedChange ?:(value : any,item : any)=>void;
};

export const ShippingListFrame: FC<ShippingListFrameProps> = (props) => {
    const {lines,value,onChange,onSelectedChange,renderPrice} = props;
    return <RadioGroup
        onSelectedChange={onSelectedChange}
        valueAttr={'id'}
        items={lines}
        value={value}
        onChange={onChange}
        renderItem={(line, checked, radio) => {
            // const price = parseFloat(line.price);
            return <div key={line.id} className={'cursor-pointer select-none flex flex-row flex-1 items-stretch p-3 space-x-3'}>
                <div className={'flex flex-col justify-center'}>
                    {radio}
                </div>
                <div className={'flex flex-row justify-between flex-1'}>
                    <div className={''}>
                        {line.name}
                    </div>
                    <div className={'space-x-2'}>
                        {renderPrice?.(line)}
                        {/*    <span className={checkout?.discount?.free_shipping && price !== 0 ? 'line-through text-gray-400 text-sm' : ''}>*/}
                        {/*        {price === 0 ? 'Free' :<Price price={line.price}/>}*/}
                        {/*    </span>*/}
                        {/*{checkout?.discount?.free_shipping*/}
                        {/*    && price !== 0*/}
                        {/*    && <span>Free</span>}*/}
                    </div>
                </div>
            </div>
        }}
    />;
};
