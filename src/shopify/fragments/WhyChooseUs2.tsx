import {FC} from "react";
import {useShopify} from "../context/ShopifyContext.ts";
import {capitalize} from "lodash-es";

export type WhyChooseUs2Props = {};

export const WhyChooseUs2: FC<WhyChooseUs2Props> = (props) => {
    const {} = props;
    const shop = useShopify();
    const title = capitalize(shop.title || shop.name ||'us') ;
    return <div className={'flex flex-col space-y-3 items-stretch'}>
        <div className={'font-bold text-center pt-5 text-base sm:text-lg'}>
            Why Over 90,000+ People Trust {title}
        </div>
        <div className={'flex flex-col space-y-2'}>
            {[{
                image : 'https://cdn.shopify.com/s/files/1/0762/4491/0316/files/10001_e0770d64-8953-4732-9327-277de9d83394.avif?v=1763041267',
                title : 'Easy & Free 30-Day Returns',
                content : `If your ${title} product isn’t the perfect match, you can return it within 30 days — we’ll process
                        your refund quickly and without any hassle.`,
            },{
                image : "https://cdn.shopify.com/s/files/1/0762/4491/0316/files/10002.avif?v=1763041267",
                title : '100% Secure Checkout',
                content : "Shop with complete confidence. Your purchase is protected with full buyer security across all major payment gateways."
            },{
                image : "https://cdn.shopify.com/s/files/1/0762/4491/0316/files/10003.avif?v=1763041268",
                title : 'Trusted by 90,000+ Customers',
                content : `${title} is a health-focused brand dedicated to helping you restore natural balance and well-being — trusted and appreciated by a growing global community`,
            }].map((item) => {
                return <div className={'flex flex-row  space-x-4 p-2 rounded-lg border border-[#D6D6D6]'}>
                    <img src={item.image} className={'size-16'} loading="eager"/>
                    <div className={'flex flex-col space-y-1'}>
                        <div className={'font-medium text-base'}>{item.title}</div>
                        <div className={'text-xs text-gray-500'}>{item.content}</div>
                    </div>
                </div>
            })}
        </div>
    </div>;
};
