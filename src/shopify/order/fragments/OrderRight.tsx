import {FC} from "react";
import {useLoaderData, useParams} from "react-router-dom";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";
import {RightFrame} from "@components/frames/RightFrame.tsx";
import {Line} from "@components/cart/Line.tsx";
import {LineDiscount} from "../../checkouts/fragments/LineItem.tsx";
import {SummaryFrame} from "../../fragments/SummaryFrame.tsx";
import Big from "big.js";

export type OrderRightProps = {};

export const OrderRight: FC<OrderRightProps> = (props) => {
    const {} = props;
    const data = useLoaderData() as Shopify.Order;
    const {action} = useParams();
    const format = useMoneyFormat();
    // const freeShipping = checkout.shipping_discount?.discountedAmount?.amount === shipping_cost?.amount;
    const shippingDiscounts = Object.values(data.shipping_discounts) as any[];
    const amounted = shippingDiscounts.reduce((a : Big,c : any) => {
        return Big(a || '0').add(c.amount || '0');
    },Big(0)) as Big;
    const shippingCurrencyCode = shippingDiscounts?.[0]?.currencyCode;
    const freeShipping = amounted.cmp(data.shipping_cost?.amount || '0') === 0;
    return <RightFrame totalPrice={format(data.total_amount)}>
        <div className={'pb-5 w-full max-w-full space-y-5'}>
            {data.line_items.map((line,i : number) => {
                const image = line.variant.image || line.product.image;
                const code =line.discounted.codes?.[0];
                return <Line
                    key={i}
                    subtotal={line.subtotal}
                    quantity={line.quantity}
                    title={line.title} total={line.total}
                    price={undefined}
                    options={line.options}
                    discounted={code ? <LineDiscount discountAllocation={{
                        discountedAmount : line.discounted,
                    }}
                                              code={code}
                    /> : null}
                    media={image ?{
                        url : image.src,
                        width : image.width,
                        height : image.height,
                    } :undefined}
                />;
            })}
        </div>
        <SummaryFrame
            renderShipping={() => {
                if(freeShipping) {
                    return <div className={'flex flex-row items-center space-x-2'}>
                        <span className={'line-through'}>{format({
                            amount : amounted.toString(),
                            currencyCode : shippingCurrencyCode,
                        })}</span>
                        <span className={'font-bold'}>FREE</span>
                    </div>
                }else{
                    return <div className={''}>
                        <span>{format(data.shipping_cost)}</span>
                    </div>
                }
            }}
            total={data.total_amount}
            subtotal={data.subtotal_amount}
            total_saved={data.total_saved}
            discount_codes={Object.keys(data.discount_codes||{}).map((code) => {
                return {
                    code,
                    amount : data.discount_codes[code],
                }
            })}
            shipping_discounts={Object.keys(data.shipping_discounts || {}).map((code) => {
                return {
                    code,
                    amount : data.shipping_discounts[code],
                }
            })}
            total_quantity={data.line_items.reduce((a,c) => {
                return a + c.quantity;
            },0)}
        />
    </RightFrame>;
};
