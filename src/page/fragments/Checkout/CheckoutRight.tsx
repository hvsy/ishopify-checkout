import React, {FC, lazy, use} from "react";
import {Right} from "../Right.tsx";
import {SummaryContext} from "../../../container/SummaryContext.tsx";

export type CheckoutRightProps = {
    className?: string;
};

const LineItems = lazy(async () => {
    const m = await import("./CheckoutLineItems.tsx");
    return {
        default : m.CheckoutLineItems,
    }
})
export const CheckoutRight: FC<CheckoutRightProps> = (props) => {
    const {className} = props;
    const summary = use(SummaryContext)
    return <Right
        summary={summary}
        className={className}
        render={() => {
            return <LineItems />
        }}
    >
    </Right>;
};
