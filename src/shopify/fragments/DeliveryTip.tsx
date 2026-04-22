import {FC} from "react";

export type DeliveryTipProps = {};

export const DeliveryTip: FC<DeliveryTipProps> = (props) => {
    const {} = props;
    return <div className={'flex flex-row space-x-3 items-center p-2 sm:p-4 border border-[#D6D6D6] rounded-lg'}
                style={{
                    gridTemplateColumns : 'auto 1fr'
                }}
    >
        <img src="https://cdn.shopify.com/s/files/1/0762/4491/0316/files/shipping_van.png?v=1763041268"
             className={'w-20'}
             loading={'lazy'}
             alt=""/>
        <div className={'flex flex-col space-y-2'}>
            <div className={'font-bold text-sm'}>
                Order by 11:00 PM → Ships Tomorrow
            </div>
            <div className={'text-xs text-gray-500'}>
                In stock, ready to ship!
            </div>
        </div>
    </div>
};
