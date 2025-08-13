import {FC} from "react";
import {CountDown} from "@components/fragments/CountDown";
import {Timer} from "lucide-react";
import {useShop} from "../../container/ShopContext.ts";
import {BreadcrumbNavigator} from "./Checkout/BreadcrumbNavigator.tsx";
import {useCheckout} from "../../container/CheckoutContext.ts";
import {Media} from "../components/Media.tsx";

export type NavProps = {
    className?: string;
};

export const Nav: FC<NavProps> = (props) => {
    const {className} = props;
    const shop = useShop();
    const checkout = useCheckout();
    return <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <div className={'pt-5 md:pt-0 flex md:block font-bold text-4xl'}>
            <a href={'/'}>
                {shop?.logo ? <Media media={shop.logo}
                                     width={80}
                                     sizes={null}
                                     deviceSizes={[80,160,240,320,400,480]}
                                     priority={true}
                                     className={'w-20 h-auto sm:pt-0 sm:w-24'}
                /> : (shop?.title || shop?.name)}
            </a>
        </div>
        {shop?.preference?.checkout?.page_style !== 'single' && <BreadcrumbNavigator />}
        {(!!checkout?.plugins?.system?.countdown?.status) ?
            <CountDown name={'checkout_'}
                prefix={<div className={'flex flex-row items-center space-x-1'}>
                       <Timer size={16}/>
                       <div>Your order is reserved for</div>
                   </div>}
                                                            suffix={"minutes!"}
                                                            auto
                                                            containerClassName={`text-sm md:text-base`}
                                                            milliseconds={checkout?.plugins?.system.countdown.time! * 60 * 1000}
                                                            format={'mm:ss.S'}
                                                            expired={<div className={`text-red-500`}>Your cart is expiring soon !</div>}

        /> : null}
    </div>
};
