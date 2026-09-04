import {FC, ReactNode, useEffect, useState} from "react";
import {CreditCardFailedDiscount} from "./CreditCardFailedDiscount.tsx";
import {PaypalRecall} from "./PaypalRecall.tsx";
import {useBusListener} from "../../../bus.tsx";
import {getJsonFromMeta} from "@lib/metaHelper.ts";

export type RecallContainerProps = {
    children ?: ReactNode;
};

const RecallDiscount = getJsonFromMeta('credit_card') as any;
export const RecallContainer: FC<RecallContainerProps> = (props) => {
    const {children} = props;
    const [method,setMethod] = useState<null|{
        type : string,
        context : any
    }>(null);
    const enabled = !!RecallDiscount?.failed?.tip;
    useBusListener("recall", (event : any) => {
        if (enabled) {
            setMethod(event);
        }
    });
    useEffect(() => {
        if (enabled && method) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            if (enabled && method) {
                document.body.style.removeProperty('overflow');
            }
        }
    }, [enabled, method]);
    return <>
        {children}
        {enabled && method && (
            <div className={'fixed inset-0 z-50'}>
                <CreditCardFailedDiscount onOpenChange={() => {
                    setMethod(null);
                }} open={true} discount={RecallDiscount?.failed?.tip}>
                    <PaypalRecall onErrorCallback={(message) => {
                        alert(message || 'Apply Discount code error');
                    }}/>
                </CreditCardFailedDiscount>
            </div>
        )}
    </>;
};
