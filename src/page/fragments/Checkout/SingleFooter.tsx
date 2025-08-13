import {FC, use} from "react";
import {ChevronLeft} from "lucide-react";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {usePaymentMethod} from "../../../container/PaymentContext.tsx";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {payment, update} from "@lib/payment.ts";
import {useBasename, useCheckout} from "../../../container/CheckoutContext.ts";
import {SummaryContext} from "../../../container/SummaryContext.tsx";
import {CurrencyContext} from "../../../container/CurrencyContext.ts";
import {MobileCheckoutBoard} from "../../../plugins/DesktopCheckoutBoard.tsx";
import Big from "big.js";
import {usePaymentLimit} from "../../../container/usePaymentLimit.ts";

export type SingleFooterProps = {
    url: string;
};

export const SingleFooter: FC<SingleFooterProps> = (props) => {
    //TODO 删除
    return null;
    // const {url} = props;
    // const form = useCurrentForm();
    // const method = usePaymentMethod();
    // const show_button = !method?.standalone?.payment;
    // const basename = useBasename();
    // const summary = use(SummaryContext);
    // const currency = CurrencyContext.use();
    // const {limit} = usePaymentLimit();
    // const original= useCheckout();
    // if(limit) return null;
    // return <div className={'flex flex-col items-center space-y-3'}>
    //     {show_button && <AsyncButton
    //         className={'w-full max-w-auto rounded-md cursor-pointer bg-black flex flex-row justify-center items-center py-3 text-white'}
    //         onClick={async () => {
    //             try {
    //                 await form.validateFields();
    //                 const values = form.getFieldsValue();
    //                 import.meta.env.DEV && console.log('validate:',values);
    //                 const checkout = await update(basename,values,original!);
    //                 if (method) {
    //                     await payment(checkout,form.getFieldsValue(), basename, method,summary,currency!);
    //                 }
    //             } catch (e) {
    //                 console.error('exception:',e);
    //             }
    //         }}
    //     >
    //         Complete order
    //     </AsyncButton>}
    //     <MobileCheckoutBoard />
    //     <a className={'flex flex-row justify-center items-center space-x-1'}
    //        href={'/cart'}
    //     >
    //         <ChevronLeft size={'16px'}/>
    //         <span>Return to cart</span>
    //     </a>
    // </div>;
};
