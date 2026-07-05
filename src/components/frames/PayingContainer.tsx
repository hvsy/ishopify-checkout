import {FC, ReactNode, useEffect, useState} from "react";
import {useEventListener} from "usehooks-ts";
import {Loading} from "../fragments/Loading.tsx";
import {Bus} from "../../bus.tsx";
import {ShieldCheck} from "lucide-react";

export type PayingContainerProps = {
    children?: ReactNode;
};

export const PayingContainer: FC<PayingContainerProps> = (props) => {
    const {children} = props;
    const [paying, setPaying] = useState<Boolean | string>(false);
    Bus.listen('payment:ing', (which ?: string) => {
        setPaying(which || true);
    });
    Bus.listen('payment:end', () => {
        setPaying(false);
    });
    useEventListener('message', (e) => {
        const data = e.data || {};
        const {type, event} = data;
        switch (event) {
            case 'paying': {
                setPaying(true);
                return;
            }
            case 'pay_end': {
                setPaying(false);
                return;
            }
        }
    });
    useEffect(() => {
        if (paying) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            if (paying) {
                document.body.style.removeProperty('overflow');
            }
        }
    }, [paying]);
    let tip = <div>payment is being processed</div>;
    if(paying === 'paypal'){
        tip  =<div className={'flex flex-col items-center space-y-2'}>
            <div className={'font-bold text-lg'}>Redirecting to PayPal...</div>
            <div>Please wait while we securely redirect you to PayPal.</div>
            <div className={'flex flex-row items-center space-x-1'}>
                <ShieldCheck className={'text-green-500'}/>
                <div>
                    Do not close or refresh this page
                </div>
            </div>
        </div>;
    }
    if(paying === 'credit-card'){
        tip  = <div className={'flex flex-col items-center space-y-2'}>
            <div className={'font-bold text-lg'}>Processing your payment...</div>
            <div>Please wait while we securely process your payment.</div>
            <div className={'flex flex-row items-center space-x-1'}>
                <ShieldCheck className={'text-teal-500'}/>
                <div>Do not close or refresh this page.</div>
            </div>
        </div>;
    }
    return <div className={'relative'}>
        {children}
        {!!paying && <div className={'fixed inset-0 z-50'}>
            <div className={' absolute inset-0 bg-white/80 backdrop-blur z-50'}></div>
            <div className={'absolute inset-0  flex flex-col justify-center items-center z-50'}>
                <div className={'flex flex-col space-y-2 items-center'}>
                    <Loading className={'size-8'}/>
                    {tip}
                </div>
            </div>
        </div>}
    </div>;
};
