import {FC, IframeHTMLAttributes, memo, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useEventCallback,} from "usehooks-ts";
import {Loading} from "@components/fragments/Loading.tsx";
import {useBusListener} from "../../../../../bus.tsx";
import PaymentMethod = DB.PaymentMethod;
import {getFinalPath, getReplacePathBase} from "@lib/api.ts";
import {useCart} from "@hooks/useCart.ts";
import {reportPaymentProgress} from "../../../../../container/PaymentContext.tsx";

export type EmbedInFrameProps = IframeHTMLAttributes<any>&{
    // active : boolean;
    method : PaymentMethod;
};

export const EmbedInFrame: FC<EmbedInFrameProps> = memo((props) => {
    const {method,src,...others} = props;
    const {token} = useCart();
    const ref = useRef<HTMLIFrameElement>(null)
    const [loading,setLoading] = useState(true);
    const onMessage = useEventCallback((e : any) => {
        const data = e.data || {};
        const  {type,event} = data;
        switch(event){
            case 'payment_method_loaded':
                setLoading(false);
                return;
        }
        // if(!['rpcRequest','rpcResponse'].includes(type)){
        //     import.meta.env.DEV && console.log('iframe message:',e);
        // }
    });
    useLayoutEffect(() => {
      window.addEventListener('message',onMessage);
      return ()=>{
          window.removeEventListener('message',onMessage);
      }
    },[]);
    useEffect(() => {
        ref.current?.contentWindow?.postMessage({
            event : 'setup',
        })
    }, []);
    useBusListener(`payment:${method.id}`, async ({values} : {step?:Function,values:any}) => {
        // const frame = document.getElementById(method.channel) as HTMLIFrameElement;
        const window = ref.current?.contentWindow
        if(!window){
            reportPaymentProgress(() => {
                return `can't find payment window:${method.channel}`;
            });
            import.meta.env.DEV && console.log(values,method);
            return;
        }
        import.meta.env.DEV && console.log('payment method submit:',values);
        window.postMessage({
            event : 'submit',
            checkout : values,
        },'*')
        reportPaymentProgress(() => {
            return `payment ${method.channel} submit`;
        });
        throw '!!!';
    });
    return <div className={'relative'}>
        <iframe
            ref={ref}
            sandbox={'allow-scripts allow-top-navigation allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-top-navigation-by-user-activation'}
            // src={src}
            id={method.id + ''}
            name={method.channel}
            height={method.height || 145}
            width={'100%'}
            src={method.embed ? getReplacePathBase(method.embed): getFinalPath(`/api/checkouts/${token}/gateway/${method.id}/embed`)}

            {...others}
        />
        {loading && <div className={'absolute inset-0 flex flex-col items-center justify-center'}>
            <Loading />
        </div>}
    </div>;
});
