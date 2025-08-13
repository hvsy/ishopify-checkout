import {FC} from "react";
import {Price} from "@components/fragments/Price.tsx";
import {Media} from "../components/Media.tsx";

export type LineItemsProps = {
    line_items ?: (DB.CartItem|DB.OrderLineItem)[];
};

export const LineItems: FC<LineItemsProps> = (props) => {
    const {line_items} = props;
    return <div className={'pb-5 w-full max-w-full space-y-5'}>
        {(line_items || []).map((item, index) => {
            return <div className={'flex flex-row w-full max-w-full'}
                        key={item.id !== undefined ? item.id : index}>
                <div className={'relative w-16'}>
                    <div
                        className={"overflow-hidden relative aspect-square rounded-md border-neutral-300 border"}>
                        <Media media={item?.variant?.attachment?.media || item?.product?.cover?.media} />
                        {item.free_gift && <div className={`absolute 
                            bg-red-500 
                            font-semibold
                            text-white  px-4 py-0.5
                            transform -rotate-45 left-[-1rem] top-0 text-[0.55rem]
                            `}>
                            Free
                        </div>}
                    </div>
                    <div className={`absolute -right-2.5 -top-2.5 rounded-full w-5 aspect-square overflow-hidden 
                            z-30
                            flex flex-row justify-center items-center text-white box-border leading-none
                            bg-neutral-500 text-sm`}>
                        {item.quantity || 1}
                    </div>
                </div>
                <div className={'flex-1 overflow-hidden col-span-3 md:col-span-5 flex flex-row space-x-2 items-stretch px-4'}>
                    <div className={'flex flex-1 flex-col justify-between items-stretch overflow-hidden'}>
                        <div className={'truncate'}>
                            {item.product.title}
                        </div>
                        <div
                            className={'text-neutral-500 text-sm'}>
                            {(item.variant.options).filter(t => !!t && t !== 'Default Title').join(" / ")}
                        </div>
                    </div>
                </div>
                <div className={'col-span-1 flex flex-row justify-end'}>
                    {item.free_gift ? <div className={''}>
                        <div className={'line-through text-xs'}>
                            <Price price={(item.quantity || 1) * parseFloat(item.variant.price)}/>
                            <div>
                        </div>
                            $0
                        </div>
                    </div> : <div className={'flex-shrink-0 pr-3 flex flex-col justify-cente'}>
                        <Price price={(item.quantity || 1) * parseFloat(item.price || item.variant.price)}/>
                    </div>}
                </div>
            </div>
        })}
    </div>
};
