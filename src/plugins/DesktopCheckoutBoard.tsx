import {FC} from "react";
import {useCheckout} from "../container/CheckoutContext.ts";
import {Media} from "../page/components/Media.tsx";
import {cn} from "@lib/cn.ts";

export type CheckoutBoardProps = {
    className ?: string;
};

export const DesktopCheckoutBoard: FC<CheckoutBoardProps> = (props) => {
    const {} = props;
    const checkout = useCheckout();
    const config = checkout?.plugins?.system?.checkout_board;
    if(!config){
        return null;
    }
    const {desktop} = config;
    if(!desktop) return null;
    return <div className={'flex-1 sm:max-w-[478px] mt-2 md:mt-5 overflow-hidden'}>
        <Media
            media={desktop}
            sizes={null}
            className={'h-auto hidden md:block'}
            imageClassName={'relative w-full h-auto'}
        />
    </div>;
};

export const MobileCheckoutBoard: FC<CheckoutBoardProps> = (props) => {
    const {className} = props;
    const checkout = useCheckout();
    const config = checkout?.plugins?.system?.checkout_board;
    if(!config){
        return null;
    }
    const {desktop,mobile} = config;
    if(!desktop && !mobile) return null;
    return <div className={cn('flex-1 w-full mt-2 md:mt-5 overflow-hidden',
        className)}>
        <Media
            media={mobile || desktop}
            sizes={null}
            className={'h-auto block md:hidden'}
            imageClassName={'relative w-full h-auto'}
        />
    </div>;
};
