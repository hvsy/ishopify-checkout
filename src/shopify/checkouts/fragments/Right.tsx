import {FC} from "react";



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
import {useCartStorage} from "@hooks/useCartStorage.ts";

export type RightProps = {};
export const Right: FC<RightProps> = (props) => {
    const {} = props;

    const storage = useCartStorage();
    const {loading,data,json} = useAllEdges(([
        QueryLineItems,
        QueryLineItemsFragment,
        QueryVariantFragment,
        QueryImageFragment,
        // QueryDeliveryFragment,
    ].join("\n")),{
            first : 10,
            cartId : storage.gid,
    },'cart.lines');
    const client=  useApolloClient();
    const discountData = client.readQuery({
        query : gql([`query Cart($cartId : ID!){
            cart(id : $cartId){
                discountCodes {
                    code
                    applicable
                }
            }
        }`,
        ].join("\n")),
        variables : {
            cartId : storage.gid,
        }
    });

    if(loading && (!data))  return <div className={'flex flex-col animate-pulse space-y-2'}>
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-gray-200"></div>
            <div className="col-span-1 h-2 rounded bg-gray-200"></div>
        </div>
    </div>
    const discountCode = _get(discountData,'cart.discountCodes',[]).filter((d:any)=>d.applicable)?.[0]?.code;

    const {json : summary,} = useSummary();
    const format = useMoneyFormat();
    return <RightFrame totalPrice={format(_get(summary,'cart.cost.totalAmount'))}>
        <div className={'pb-5 w-full max-w-full space-y-5'}>
            {data.map((line : any) => {
                return <LineItem key={line.id} line={line} code={discountCode}/>
            })}
        </div>
        <ShopifyCouponForm />
        <Summary lines={data}/>
    </RightFrame>;
};
