import {CheckoutContainer} from "./CheckoutContext.ts";
import {use} from "react";
import {SummaryContext} from "./SummaryContext.tsx";
import Big from "big.js";
import {isNumber} from "lodash-es";

export function usePaymentLimit(){
    const checkout = CheckoutContainer.use();
    const summary = use(SummaryContext);
    const limit = checkout?.shop.preference?.checkout?.order_amount_limit;
    const currency = checkout?.shop.currency;
    const rate = currency?.rate;
    const total = Big(summary.total);
    const limit_alert =  isNumber(limit) && total?.gt(limit) ?`${currency?.symbol}${limit}` : null;
    const payment_limit = checkout?.shop.payment_limit && total.gt(Big(checkout?.shop.payment_limit).mul(rate || '1'));
    return {
        limit : payment_limit,
        alert : limit_alert,
        total,
    }
}
