import {FC, useEffect, useRef} from "react";
import {CouponFormFrame} from "@components/frames/CouponFormFrame.tsx";
import {gql, useMutation} from "@apollo/client";
import {uniq as _uniq, get as _get} from "lodash-es";

import {useSummary} from "../hooks/useSummary.tsx";
import {
    QueryBuyerIdentityFragment,
    QueryCartDiscountAllocationFieldsFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment,
    QueryDiscountsFragment,
    QueryErrorsFragment
} from "@query/checkouts/fragments/fragments.ts";
import {MutateDiscountCode} from "@query/checkouts/mutations.ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useCart} from "@hooks/useCart.ts";
import {useNavigate, useSearchParams} from "react-router-dom";

export const ShopifyCouponForm: FC = () => {
    const {gid} = useCart();
    // mutation 一次把 Summary 需要的 CartFields（discountCodes/cost 等）与
    // Discounts（lines[].discountAllocations(lineLevelOnly:false) /
    // deliveryGroups[].discountAllocations）全部带回并写入缓存，
    // Summary 立即更新；同时 refetch Summary/GetDeliveryGroups 兜底。
    const [fn] = useMutation(gql([
        MutateDiscountCode,
        QueryDiscountsFragment,
        QueryCartDiscountAllocationFieldsFragment,
        QueryErrorsFragment,
        QueryCartFieldsFragment,
        QueryBuyerIdentityFragment,
        QueryDeliveryFragment,
    ].join("\n")), {
        // 行项目价格/折扣分配会随优惠券变化，需要刷新 CartLineItems；
        // 运费折扣（免运费码）在 deliveryGroups 上，刷新 Summary 与
        // GetDeliveryGroups 才能让 Summary 和快递方式列表立即显示减免后的价格。
        refetchQueries: ['Summary', 'CartLineItems', 'GetDeliveryGroups'],
        awaitRefetchQueries: true,
        variables: {
            cartId: gid,
        }
    });
    const {json: query} = useSummary();
    const sync = useCheckoutSync();

    const [search] = useSearchParams();
    const discountCode = search.get('discount_code');
    const currentDiscountCode = _get(query, 'cart.discountCodes', [])
        .filter((d: {applicable?: boolean}) => !!d.applicable)
        .map((item: {code?: string}) => item.code)
        .filter((code: string | undefined): code is string => !!code);
    const currentDiscountCodeRef = useRef(currentDiscountCode);
    currentDiscountCodeRef.current = currentDiscountCode;
    // 防止 StrictMode/重复渲染时同一券并发提交多次
    const applyingRef = useRef(false);
    // 失败的券在本次会话内不再自动重试
    const failedRef = useRef(new Set<string>());
    const navigate = useNavigate();
    useEffect(() => {
        if (!discountCode || applyingRef.current || failedRef.current.has(discountCode)) return;
        const current = currentDiscountCodeRef.current;
        if (current.includes(discountCode)) return;
        applyingRef.current = true;
        fn({
            variables: {
                // 保留购物车中已生效的券，只追加 url 里的券
                codes: _uniq([...current, discountCode]),
            },
            awaitRefetchQueries: true,
        }).then(() => {
            return sync();
        }).then(() => {
            const newSearch = new URLSearchParams(search);
            newSearch.delete('discount_code');
            navigate({
                search: newSearch.toString()
            }, {
                replace: true,
            });
        }).catch((e) => {
            // 券无效或接口失败：本次会话不再自动重试，并保留 url 参数方便排查
            failedRef.current.add(discountCode);
            console.error('auto apply discount_code failed:', discountCode, e);
        }).finally(() => {
            applyingRef.current = false;
        });
    }, [discountCode, fn, navigate, search, sync]);
    return <CouponFormFrame
        discounts={currentDiscountCode.map((code: string) => {
            return {code};
        })}
        onClick={async (code: string, codes) => {
            await fn({
                variables: {
                    codes: _uniq([...codes, code]),
                },
                awaitRefetchQueries: true,
            });
            await sync();
        }}
        onRemove={async (code: string, codes) => {
            const after = _uniq(codes.filter(c => c !== code));
            await fn({
                variables: {
                    codes: after,
                },
                awaitRefetchQueries: true,
            })
            await sync();
        }}
    />;
};
