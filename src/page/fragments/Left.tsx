import {FC,} from "react";
import {Default} from "@/hooks/client";
import {CheckoutForm} from "./Checkout/CheckoutForm.tsx";
import {useShop} from "../../container/ShopContext.ts";
import {Nav} from "./Nav.tsx";

export type LeftProps = {
    className?: string;
};

export const Left: FC<LeftProps> = (props) => {
    const {  className = ''} = props;
    const shop = useShop();
    return <div className={`flex flex-col flex-1 items-stretch space-y-6 sm:max-w-[638px] ${className}`}>
        <Default>
            <Nav className={'hidden sm:flex'}/>
        </Default>
        <div className={'flex flex-col space-y-10 flex-1'}>
            <CheckoutForm />
        </div>
        <div className={'pb-10 text-default-500 text-sm'}>
            All rights reserved {shop.title || shop.name}
        </div>
    </div>
};
