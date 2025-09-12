import {FC, ReactNode} from "react";
import {Media} from "../../page/components/Media.tsx";
import {useMoneyFormat} from "../../shopify/context/ShopifyContext.ts";
import {SmartDiv} from "../ui/SmartDiv.tsx";

export type LineProps = {
    media ?: DB.Media|null;
    free ?: boolean;
    quantity : number;
    title : string;
    options ?: string[];
    total : {
        amount ?: number|string;
    };
    price : ReactNode;
    subtotal : {
        amount ?: number|string;
    };
    discounted  ?: ReactNode;
};

export const Line: FC<LineProps> = (props) => {
    const {total,price,discounted,subtotal,title,media,free,quantity,options = [] } = props;
    const format = useMoneyFormat();
    return <div className={'flex flex-row w-full max-w-full'}>
        <div className={'relative w-16'}>
            <SmartDiv
                className={"overflow-hidden relative aspect-square rounded-md border-neutral-300 border"}>
                <Media media={media} />
                {free && <div className={`absolute 
                            bg-red-500 
                            font-semibold
                            text-white  px-4 py-0.5
                            transform -rotate-45 left-[-1rem] top-0 text-[0.55rem]
                            `}>
                    Free
                </div>}
            </SmartDiv>
            {!import.meta.env.VITE_SKELETON && <div className={`absolute -right-2.5 -top-2.5 rounded-full w-5 aspect-square overflow-hidden 
                            z-30
                            flex flex-row justify-center items-center text-white box-border leading-none
                            bg-neutral-500 text-sm`}>
                {quantity || 1}
            </div>}
        </div>
        <div className={'flex-1 overflow-hidden col-span-3 md:col-span-5 flex flex-row space-x-2 items-stretch px-4'}>
            <div className={'flex flex-1 flex-col justify-center items-stretch overflow-hidden'}>
                <SmartDiv className={'truncate'}>
                    {title}
                </SmartDiv>
                <SmartDiv className={'text-neutral-500 text-sm'} loadingClassName={'mt-2 max-w-[50px]'}>
                    {(options).filter(t => !!t && t !== 'Default Title').join(" / ")}
                </SmartDiv>
                {discounted}
            </div>
        </div>
        <div className={'col-span-1 flex flex-row justify-end items-center'}>
            {(total?.amount !== subtotal?.amount) ? <div className={'flex flex-col items-end'}>
                <div className={'line-through text-xs'}>
                    {format(subtotal)}
                </div>
                <div>
                    {parseFloat(total.amount + '') === 0 ? 'FREE' : format(total)}
                </div>
            </div> : <SmartDiv className={'flex-shrink-0 pr-0 flex flex-col justify-center min-w-10'}>
                {format(total)}
            </SmartDiv>}
        </div>
    </div>;
};
