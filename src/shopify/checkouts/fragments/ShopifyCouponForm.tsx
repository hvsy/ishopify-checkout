import {FC} from "react";
import {CouponFormFrame} from "@components/frames/CouponFormFrame.tsx";
import {gql, useMutation, useQuery} from "@apollo/client";
import {uniq as _uniq, get as _get} from "lodash-es";

export type ShopifyCouponFormProps = {};

import {useSummary} from "../hooks/useSummary.tsx";
import {
    QueryDiscountsFragment,
    QueryErrorsFragment
} from "@query/checkouts/fragments/fragments.ts";
import {MutateDiscountCode} from "@query/checkouts/mutations.ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";

export const ShopifyCouponForm: FC<ShopifyCouponFormProps> = (props) => {
    const {} = props;
    const storage = useCartStorage();
    const [fn, {data, loading, error}] = useMutation(gql([
        // QueryCartFieldsFragment,
        QueryDiscountsFragment,
        QueryErrorsFragment,
        // LineQuery,
        // VariantQuery,
        // ImageQuery,
        // DeliveryQuery,
        MutateDiscountCode,
        QueryDiscountsFragment,
    ].join("\n")), {
        refetchQueries: ['Summary', 'CartLineItems',],
        awaitRefetchQueries : true,
        variables: {
            cartId: storage.gid,
            // first : 100,
        }
    });
    const {json: query} = useSummary();
    // const {data : query} = useQuery(gql([`
    //     query GetDiscounts($cartId : ID!){
    //         cart(id :$cartId){
    //             ...discounts
    //         }
    //     }
    // `,DiscountsQuery].join("\n")),{
    //     variables : {
    //         cartId : GetCartGid()
    //     }
    // });
    const sync = useCheckoutSync();

    return <CouponFormFrame
        discounts={_get(query, 'cart.discountCodes', []).filter((d: any) => d.applicable).map((item: any) => {
            return {
                code: item.code,
            }
        })}
        onClick={async (code: string, codes) => {
                await fn({
                    variables: {
                        codes: _uniq([...codes, code]),
                    },
                    awaitRefetchQueries : true,
                });
                await sync();
        }}
        onRemove={async (code: string, codes) => {
            const after = _uniq(codes.filter(c => c !== code));
            await fn({
                variables: {
                    codes: after,
                },
                awaitRefetchQueries : true,
            })
            await sync();
        }}
    />;
};
