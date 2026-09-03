import mitt from 'mitt';
import {useEffect, useEffectEvent} from "react";
import {isArray, isFunction, isObjectLike} from "lodash-es";


function emitAsync(type: string, data: any) {
    //@ts-ignore
    const fns = [].concat(this.emitter.all.get('*')).concat(this.emitter.all.get(type))
    .filter(Boolean)
    //@ts-ignore
    return Promise.all(fns.map(fn => fn(data)))
}

function mittAsync(all: any) {
    const inst = mitt(all);
    //@ts-ignore
    inst.emitAsync = emitAsync;
    return inst;
}

function createAsyncEmitter() {
    const emitter = mitt();

    return {
        ...emitter,
        set(set : {[name : string] : Function}){
            if(isObjectLike(set)){
                Object.keys(set).forEach((which) => {
                    const value = set[which];
                    if(isFunction(value)){
                        emitter.on(which,value);
                    }
                });
                return ()=>{
                    Object.keys(set).forEach((which) => {
                        const value = set[which];
                        if(isFunction(value)){
                            emitter.off(which,value);
                        }
                    });
                }
            }
        },
        listen(type: string | string[], callback: any) {
           if (isArray(type)) {
                type.forEach((which) => {
                    emitter.on(which, callback);
                })
                return () => {
                    type.forEach((which) => {
                        emitter.off(which, callback);
                    })
                }
            } else {
                emitter.on(type, callback);
                return () => {
                    emitter.off(type, callback);
                }
            }
        },
        async emitAsync(type: string, event: any = {}) {
            //@ts-ignore
            const fns = [].concat(emitter.all.get('*')).concat(emitter.all.get(type))
            .filter(Boolean)
            //@ts-ignore
            return Promise.all(fns.map(fn => fn(event)))
        }
    };
}

export function useBusSet(listeners : {[name : string] : Function}){
    useEffect(() => {
        return Bus.set(listeners);
    },[listeners]);
}
export function useBusListener(type: string | string[], callback: Function) {
    const listener = useEffectEvent(callback);
    const key = typeof type === 'string' ? type : type.join('|');
    useEffect(() => {
        return Bus.listen(type, listener);
    }, [key, listener]);
}

export const Bus = createAsyncEmitter();
