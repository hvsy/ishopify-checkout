import {FC, IframeHTMLAttributes, memo, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useEventCallback, useEventListener} from "usehooks-ts";
import {Loading} from "@components/fragments/Loading.tsx";
import {useForm} from "rc-field-form";

export type EmbedInFrameProps = IframeHTMLAttributes<any>&{
    active : boolean;
};

export const EmbedInFrame: FC<EmbedInFrameProps> = memo((props) => {
    const {src,active,...others} = props;
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
        if(!['rpcRequest','rpcResponse'].includes(type)){
            console.log('iframe message:',e);
        }
    });
    useLayoutEffect(() => {
      window.addEventListener('message',onMessage);
      return ()=>{
          window.removeEventListener('message',onMessage);
      }
    },[]);
    useEffect(() => {
        if(active){
            ref.current?.contentWindow?.postMessage({
                event : 'setup',
            })
        }
    }, [active]);
    return <div className={'relative'}>
        <iframe
            ref={ref}
            sandbox={'allow-scripts allow-top-navigation allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-top-navigation-by-user-activation'}
            src={src}
            {...others}
        />
        {loading && <div className={'absolute inset-0 flex flex-col items-center justify-center'}>
            <Loading />
        </div>}
    </div>;
});
