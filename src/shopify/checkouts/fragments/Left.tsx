import {FC, ReactNode, useState} from "react";
import {Default} from "@hooks/client.ts";
import {useShopify} from "../../context/ShopifyContext.ts";
import {SingleCheckoutForm} from "./SingleCheckoutForm.tsx";
import {Skeleton} from "@components/ui/Skeleton.tsx";
import {HighDemandCountDown} from "../../fragments/HighDemandCountDown.tsx";
import dayjs from "dayjs";
import {DialogHeader,Dialog, DialogContent, DialogTitle} from "@components/ui/dialog.tsx";
import {Policy} from "./Policy.tsx";

export type LeftProps = {
    className ?: string;
    renderNav ?: (className ?: string)=>ReactNode;
};

export const Left: FC<LeftProps> = (props) => {
    const {renderNav,className = ''} = props;
    const shop = useShopify();
    const title = shop.title || shop.name;
    const [showPolicy,setShowPolicy] = useState(false);
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
        <HighDemandCountDown />
        <div className={'flex flex-col space-y-10 flex-1'}>
            <SingleCheckoutForm />
            {/*<CheckoutForm />*/}
        </div>
        <div className={'border-t pb-4'}></div>
        {import.meta.env.VITE_SKELETON ?<Skeleton className={'max-w-32 min-w-10 min-h-4'} /> :<div className={'pl-2 text-xs flex flex-col gap-[.5rem] !mt-0'}>
             <span
                 className={'cursor-pointer hover:underline'}
                 onClick={() => setShowPolicy(true)}
             >
                Privacy policy
            </span>
            <span>© {dayjs().format('YYYY')},{title} Powered by Shopify</span>
        </div>}
        <Dialog open={showPolicy} onOpenChange={setShowPolicy}>
            <DialogContent className="max-w-4xl p-0 rounded-xl">
                <DialogHeader>
                    <DialogTitle className={'py-2'}>Privacy policy</DialogTitle>
                </DialogHeader>
                <div className="px-6">
                    <Policy />
                </div>
            </DialogContent>
        </Dialog>
    </div>;
};
