import {FC, ReactNode} from "react";
import {Default} from "@hooks/client.ts";
import {useShopify} from "../../context/ShopifyContext.ts";
import {CheckoutForm} from "./CheckoutForm.tsx";
import {SingleCheckoutForm} from "./SingleCheckoutForm.tsx";
import {Skeleton} from "@components/ui/Skeleton.tsx";

export type LeftProps = {
    className ?: string;
    renderNav ?: (className ?: string)=>ReactNode;
};

export const Left: FC<LeftProps> = (props) => {
    const {renderNav,className = ''} = props;
    const shop = useShopify();
    const title = shop.title || shop.name;
    let top = null;
    if(renderNav){
        if(import.meta.env.VITE_SKELETON){
            top = renderNav("hidden sm:flex")
        }else{
            top = <Default>
                {renderNav("hidden sm:flex")}
            </Default>;
        }
    }
    return  <div className={`flex flex-col flex-1 items-stretch space-y-6 sm:max-w-[638px] ${className}`}>
        {top}
        <div className={'flex flex-col space-y-10 flex-1'}>
            <SingleCheckoutForm />
            {/*<CheckoutForm />*/}
        </div>
        {import.meta.env.VITE_SKELETON ?<Skeleton className={'max-w-32 min-w-10 min-h-4'} /> :<div className={'pb-10 text-default-500 text-sm'}>
            All rights reserved {title}
        </div>}
    </div>;
};
