import mitt, {EventType} from 'mitt';
import {useEventCallback} from "usehooks-ts";
import {useEffect, useEffectEvent} from "react";




function emitAsync (type : string, data  :any)  {
    //@ts-ignore
    const fns = [].concat(this.emitter.all.get('*')).concat(this.emitter.all.get(type))
    .filter(Boolean)
    //@ts-ignore
    return Promise.all(fns.map(fn => fn(data)))
}
function mittAsync(all : any) {
    const inst = mitt(all);
    //@ts-ignore
    inst.emitAsync = emitAsync;
    return inst;
}

function createAsyncEmitter(){
        const emitter = mitt();

        return {
            ...emitter,
            listen(type : string,callback : any){
                emitter.on(type,callback);
                return ()=>{
                    emitter.off(type,callback);
                }
            },
            async emitAsync(type : string, event : any = {}) {
                //@ts-ignore
                const fns = [].concat(emitter.all.get('*')).concat(emitter.all.get(type))
                .filter(Boolean)
                //@ts-ignore
                return Promise.all(fns.map(fn => fn(event)))
            }
        };
}

export function useBusListener(type : string,callback : Function){
    const listener = useEffectEvent(callback);
    useEffect(() => {
        return Bus.listen(type,listener);
    }, [type,listener]);
}

export const Bus = createAsyncEmitter();
