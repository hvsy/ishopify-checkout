import React, {FC} from "react";
import {Line} from "@components/cart/Line.tsx";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";
import {get as _get} from "lodash-es";
import {TagIcon} from "lucide-react";

export type LineItemProps = {
    line: any
    code?: string;
};

export const LineDiscount: FC<{code ?: string, discounted: any }> = (props) => {
    const {discounted,code} = props;
    if (!discounted) return null;
    const amount = discounted.amount;
    const format = useMoneyFormat();
    const price = !!parseFloat(amount) ? `(-${format(discounted)})` : '';
    return <div className={'flex flex-row items-center  space-x-1 text-sm text-gray-500'}>
        <TagIcon className={'size-4 scale-x-[-1]'}/>
        <span>
            {code}
        </span>
        <span>
            {price}
        </span>
    </div>;

};
export const LineItem: FC<LineItemProps> = (props) => {
    const {line = {}, code} = props;
    const {merchandise = {}, quantity, cost = {}, discountAllocations} = line;
    const {totalAmount, subtotalAmount} = cost;
    const {product, price, selectedOptions, image} = merchandise;
    const title = product.title;
    const discountedAmount = _get(discountAllocations, '0.discountedAmount')
    return <Line
        title={title}
        media={{
            url: image.src,
            width: image.width,
            height: image.height,
        }}
        discounted={<LineDiscount discounted={discountedAmount} code={code}/>}
        price={price.amount}
        quantity={quantity}
        options={(selectedOptions || []).map((opt: any) => opt.value)}
        total={totalAmount}
        subtotal={subtotalAmount}
        free={parseFloat(totalAmount.amount) == 0}
    />;
};
