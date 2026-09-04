import {FC} from "react";
import {getMetaContent} from "@lib/metaHelper.ts";
import {Bus, useBusListener} from "../../../../../bus.tsx";
import {api, getFinalPath} from "@lib/api.ts";
import Cookies from "js-cookie";
import {isObjectLike} from "lodash-es";
import PaymentMethod = DB.PaymentMethod;
import {PromiseLocation} from "../../../../../shopify/lib/promiseLocation.ts";
import {useParams} from "react-router-dom";
import {reportPaymentProgress} from "../../../../../container/PaymentContext.tsx";

export type PaymentTipProps = {
    method : PaymentMethod;
};

const payment_title = getMetaContent('payment_title') || 'Place an order';
export const RedirectPaymentMethod: FC<PaymentTipProps> = (props) => {
    const {method} = props;
    const {token} = useParams();
    import.meta.env.DEV && console.log('redirect payment method:',method);
    useBusListener([`payment:${method.id}`,`payment:redirect:${method.type}`], async ({step} : {step ?: Function}) => {
        const target = `/a/s/api/checkouts/${token}/gateway/${method.id}`;
        const res : any = await api<any>({
            method : "put",
            url: target,
            data : {
                recovery_key : Cookies.get('recovery_key'),
            }
        });
        if(!res || (isObjectLike(res) && res.error)){
            const message = isObjectLike(res) ? res.message : undefined;
            if(message){
                reportPaymentProgress(() => {
                    return "payment api error:" + message;
                });
                console.error(message);
            }else{
                reportPaymentProgress(() => {
                    return "payment api error";
                });
            }
            Bus.emit('payment:error',true);
            return false;
        }
        const href= getFinalPath(`/api/transactions/${res}/redirect`);
        reportPaymentProgress(() => {
            return "before payment redirect";
        });
        return PromiseLocation(href);
    })
    return <div className={'p-4 flex flex-1 flex-col justify-center items-center text-slate-600'}>
        <img
            className={'h-28 w-40'}
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0yNTIuMyAzNTYuMSAxNjMgODAuOSIgY2xhc3M9ImVIZG9LIj48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0tMTA4LjkgNDA0LjF2MzBjMCAxLjEtLjkgMi0yIDJILTIzMWMtMS4xIDAtMi0uOS0yLTJ2LTc1YzAtMS4xLjktMiAyLTJoMTIwLjFjMS4xIDAgMiAuOSAyIDJ2MzdtLTEyNC4xLTI5aDEyNC4xIj48L3BhdGg+PGNpcmNsZSBjeD0iLTIyNy44IiBjeT0iMzYxLjkiIHI9IjEuOCIgZmlsbD0iY3VycmVudENvbG9yIj48L2NpcmNsZT48Y2lyY2xlIGN4PSItMjIyLjIiIGN5PSIzNjEuOSIgcj0iMS44IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvY2lyY2xlPjxjaXJjbGUgY3g9Ii0yMTYuNiIgY3k9IjM2MS45IiByPSIxLjgiIGZpbGw9ImN1cnJlbnRDb2xvciI+PC9jaXJjbGU+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNLTEyOC43IDQwMC4xSC05Mm0tMy42LTQuMSA0IDQuMS00IDQuMSI+PC9wYXRoPjwvc3ZnPgo="
            alt=""/>
        <div className={'text-sm text-center'}>
            After clicking “{payment_title}”, you will be redirected to payment page to complete your purchase securely.
        </div>
    </div>;
};
