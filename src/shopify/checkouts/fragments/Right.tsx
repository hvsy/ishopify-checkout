import React, {FC, use,} from "react";


import {useAllEdges} from "@hooks/useAllEdges.ts";
import {LineItem} from "./LineItem.tsx";
import {RightFrame} from "@components/frames/RightFrame.tsx";
import {ShopifyCouponForm} from "./ShopifyCouponForm.tsx";
import {useDiscountCodeManager} from "@hooks/useDiscountCodeManager.ts";
import {get as _get} from "lodash-es";
import {Summary} from "./Summary.tsx";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";
import {useSummary} from "../hooks/useSummary.tsx";
import {gql, useApolloClient} from "@apollo/client";
import {
    QueryImageFragment,
    QueryLineItemsFragment,
    QueryVariantFragment
} from "@query/checkouts/fragments/fragments.ts";
import {QueryLineItems} from "@query/checkouts/queries.ts";
import {useCart} from "@hooks/useCart.ts";
import {getGlobalPath} from "../../lib/globalSettings.ts";
import {Media} from "../../../page/components/Media.tsx";
import {WhyChooseUs2} from "../../fragments/WhyChooseUs2.tsx";
import {Features} from "@lib/flags.ts";
import {WhyChooseUs} from "../../fragments/WhyChooseUs.tsx";
import {useWindowSize} from "usehooks-ts";
import {Skeleton} from "@components/ui/Skeleton.tsx";
import {ShopifyCheckoutContext} from "../../context/ShopifyCheckoutContext.tsx";
import {CheckoutPixelReport} from "./CheckoutPixelReport.tsx";


const WhyChooseVersion = Features.includes('why_choose_v2')
export type RightProps = {};
const ShowLinesInMobile = Features.includes('mobile:show_lines');
export const Right: FC<RightProps> = (props) => {
    const {} = props;

    const {gid} = useCart();
    const {cartLinePriceLoading} = use(ShopifyCheckoutContext);
    const {json: summary,} = useSummary();
    // CheckoutQuery 已经取回前 10 条行项目，这里等它返回后再让 useAllEdges
    // 从缓存读取，避免进入结算页时再发一次独立的 CartLineItems 请求。
    const hasLines = !!_get(summary,'cart.lines');
    const {data, json} = useAllEdges(([
        QueryLineItems,
        QueryLineItemsFragment,
        QueryVariantFragment,
        QueryImageFragment,
        // QueryDeliveryFragment,
    ].join("\n")), {
        first: 10,
        cartId: gid,
    }, 'cart.lines', !hasLines);
    const client = useApolloClient();
    // useAllEdges 在 CheckoutQuery 返回前被 skip，此时先用 summary 里的缓存行项目渲染。
    const lineNodes = data && data.length > 0 ? data : (_get(summary,'cart.lines.edges',[]) as any[]).map((edge: any) => edge.node);
    const displayJson = json || summary;
    const format = useMoneyFormat();
    const {width} = useWindowSize({
        initializeWithValue : true,
    });
    const discount = useDiscountCodeManager();
    const pcImage = getGlobalPath('profile.pc.resource.image');
    let discountData = null;
    try {
        discountData = client.readQuery({
            query: gql([`query Cart($cartId : ID!){
                cart(id : $cartId){
                    discountCodes {
                        code
                        applicable
                    }
                }
            }`,
            ].join("\n")),
            variables: {
                cartId: gid,
            }
        });
    } catch {
        // 缓存未就绪时 readQuery 会抛异常，此时先按无折扣码渲染，
        // 等 Summary/CartLineItems 查询返回后自然更新。
        discountData = null;
    }
    // const showSketeton = (loading && !cartLinePriceLoading) || !_get(json, 'cart.lines');
    // const showSketeton = true;
    const showSketeton = !_get(displayJson,'cart.lines');
    const discountCode = _get(discountData, 'cart.discountCodes', []).filter((d: any) => d.applicable)?.[0]?.code;
    const final = width >= 640;
    const LinesContainerClassName=  `${(final || !ShowLinesInMobile) ? `pb-5 ${final ? 'overflow-hidden' : ''}  space-y-5` : 'px-6 pt-3 max-h-[200px] overflow-y-scroll  space-y-3'} w-full max-w-full  sm:overflow-visible`;
    const lines = <div className={`${LinesContainerClassName}`}>
        {showSketeton ? <div className={'flex flex-row items-center w-full max-w-full'}>
            <Skeleton className={'w-16 h-16 rounded'}></Skeleton>
            <div className={'mx-4 flex-1 flex flex-col justify-center min-h-16 space-y-2 '}>
                <Skeleton className={'h-5 max-w-[80%]'}/>
                <Skeleton className={'h-3 max-w-[30%]'}/>
            </div>
            <Skeleton className={'h-5 w-12'}/>
        </div> : lineNodes.map((line: any) => {
            return <LineItem key={line.id} line={line} code={discountCode} priceLoading={cartLinePriceLoading}/>
        })}
    </div>;
    return <>
        <RightFrame
            windowWidth={width}
            header={!final && ShowLinesInMobile && lines} totalPrice={
            showSketeton ? <Skeleton className={'w-16 min-h-5 max-h-5'}/> : format(_get(summary, 'cart.cost.totalAmount'))}>
            {(final || !ShowLinesInMobile) && lines}
            <ShopifyCouponForm codes={discount.codes} apply={discount.apply} remove={discount.remove}/>
            <Summary />
            <CheckoutPixelReport lines={lineNodes} json={summary} />
            {pcImage?.url && <div className={'hidden sm:flex pt-8 flex-col items-stretch'}>
                <Media media={{
                    url: pcImage.url,
                    width: pcImage.width,
                    height: pcImage.height,
                }} width={pcImage.width}/>
            </div>}
            {WhyChooseVersion ? <div className={'hidden sm:flex flex-col'}>
                <WhyChooseUs2/>
            </div> : <WhyChooseUs/>}
        </RightFrame>
    </>;
};
