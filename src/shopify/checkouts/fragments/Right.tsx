import {FC,} from "react";


import {useAllEdges} from "@hooks/useAllEdges.ts";
import {LineItem} from "./LineItem.tsx";
import {RightFrame} from "@components/frames/RightFrame.tsx";
import {ShopifyCouponForm} from "./ShopifyCouponForm.tsx";
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


const WhyChooseVersion = Features.includes('why_choose_v2')
export type RightProps = {};
const ShowLinesInMobile = Features.includes('mobile:show_lines');
export const Right: FC<RightProps> = (props) => {
    const {} = props;

    const {gid} = useCart();
    const {loading, data, json} = useAllEdges(([
        QueryLineItems,
        QueryLineItemsFragment,
        QueryVariantFragment,
        QueryImageFragment,
        // QueryDeliveryFragment,
    ].join("\n")), {
        first: 10,
        cartId: gid,
    }, 'cart.lines');
    const client = useApolloClient();
    const {json: summary,} = useSummary();
    const format = useMoneyFormat();
    const {width} = useWindowSize({
        initializeWithValue : true,
    });
    const pcImage = getGlobalPath('profile.pc.resource.image');
    const discountData = client.readQuery({
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
    const showSketeton = loading || !_get(json, 'cart.lines');
    // const showSketeton = true;
    const discountCode = _get(discountData, 'cart.discountCodes', []).filter((d: any) => d.applicable)?.[0]?.code;
    const final = width >= 640;
    const lines = <div className={`${(final || !ShowLinesInMobile) ? `pb-5  ${final ? 'overflow-hidden' : ''}  space-y-5` : 'px-6 pt-3 max-h-[200px] overflow-y-scroll  space-y-3'} w-full max-w-full  sm:overflow-visible`}>
        {showSketeton ? <div className={'flex flex-row items-center w-full max-w-full'}>
            <Skeleton className={'w-16 h-16 rounded'}></Skeleton>
            <div className={'mx-4 flex-1 flex flex-col justify-center min-h-16 space-y-2 '}>
                <Skeleton className={'h-5 max-w-[80%]'}/>
                <Skeleton className={'h-3 max-w-[30%]'}/>
            </div>
            <Skeleton className={'h-5 w-12'}/>
        </div> :data.map((line: any) => {
            return <LineItem key={line.id} line={line} code={discountCode}/>
        })}
    </div>;
    return <>
        <RightFrame
            windowWidth={width}
            header={!final && ShowLinesInMobile && lines} totalPrice={
            showSketeton ? <Skeleton className={'w-16 min-h-5 max-h-5'}/> : format(_get(summary, 'cart.cost.totalAmount'))}>
            {(final || !ShowLinesInMobile) && lines}
            <ShopifyCouponForm/>
            <Summary lines={data}/>
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
