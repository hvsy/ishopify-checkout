import {FC, use} from "react";
import {SummaryContext} from "../../container/SummaryContext.tsx";
import {Report} from "./Report.tsx";
import {CheckoutContainer} from "../../container/CheckoutContext.ts";
import {reduce as _reduce} from "lodash-es";

export type CheckoutStartedProps = {};

export const CheckoutStarted: FC<CheckoutStartedProps> = (props) => {
    const {} = props;
    const summary = use(SummaryContext)
    const value = CheckoutContainer.use();
    if(!value) return null;
    return <Report
        token={value.token}
        name={'checkout_started'} data={{
        content_ids : (value?.line_items||[]).map((line) => {
            return line.product.id + '';
        }),
        quantity : _reduce((value?.line_items||[]),(acc,line)=>{
            return acc + line.quantity;
        },0 as number),
    }} price={summary.total + ''} />;
};
