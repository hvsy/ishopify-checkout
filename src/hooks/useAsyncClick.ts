import {useCallback, useRef, useState} from "react";
import {flushSync} from "react-dom";

export type AsyncResult<T extends any = any> =  {
    loading  : boolean;
    success ?: T|null,
    error ?: any;
};

export function useAsyncClick<T extends any = any>(click ?: Function){
    const [state,setState] = useState<AsyncResult<T>>({
        loading : false,
    });
    const loadingRef = useRef<AsyncResult>(state);
    loadingRef.current = state;
    const onClick = useCallback((e ?: any,...args : any[]) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        if(loadingRef.current.loading) return;
        flushSync(() => {
            setState({
                success : undefined,
                error : undefined,
                loading : true,
            });
        });
        if(click){
            const result = click(e,...args);
            if(result && result['finally']){
                result.then((success : any)=>{
                    flushSync(() => {
                        setState({
                            success,
                            error : null,
                            loading : false,
                        });
                    });
                },(error : any)=>{
                    flushSync(() => {
                        setState({
                            success : null,
                            error,
                            loading : false,
                        });
                    });
                })
            }
        }else{
            flushSync(() => {
                setState({
                    success : undefined,
                    error : undefined,
                    loading : false,
                });
            });
        }
    },[click]);
    return [state,onClick] as const;
}
