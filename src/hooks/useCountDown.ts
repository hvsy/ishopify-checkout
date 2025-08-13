import dayjs from "dayjs";
import {useEffect, useMemo, useState} from "react";
import {Prefix} from "@lib/AppStorage";

export type CountDownPrecision = 0 | 1 | 2;
export type CountDownInitialCallback =[(duration : number)=>number,(duration:number)=>void];
export const LocalStorage = (name : string ,prefix : string = (Prefix || '')) : CountDownInitialCallback=>{
    const key = `${prefix}__countdown_${name}__`;
    return [(duration : number) => {
        let initialValue = 0;
        if(typeof window === 'undefined') return initialValue;
        const lastCreatedAt = window.localStorage?.getItem(key);
        if (lastCreatedAt) {
            const diff = Math.floor((dayjs().diff(dayjs(lastCreatedAt), 'millisecond')));
            if (diff < duration) {
                initialValue = (duration - diff);
            }
        }
        return initialValue;
    }, (_: number) => {
        localStorage.setItem(key, dayjs().format())
    }] as const;
}

export type CountDownOptions = {
    precision ?: CountDownPrecision,
    callback ?: CountDownInitialCallback
    /**
     * 自动开始倒计时
     */
    auto ?: boolean;
    /**
     * 循环倒计时
     */
    loop ?: boolean;
}
export function useCountdown(duration: number ,
                             options ?: CountDownOptions,
) {
    const {precision = 0,callback,auto = true,loop = false} = options || {};
    const [iv,save] = useMemo(() => {
        if(auto){
            return callback ? [(callback?.[0])(duration),callback[1]] : [duration,null];
        }
        return [0,callback ? callback[1] : null];
    }, [duration,callback]);
    const [initialValue, setInitialValue] = useState(iv);
    const [countdown, setCountdown] = useState(initialValue);
    const divisor = Math.pow(10,3-precision);
    useEffect(() => {
        if (!initialValue) return;
        let timer: number | null = null;
        const stop = () => {
            if(timer)   {
                clearTimeout(timer);
                timer = null;
            }
        };
        let next = () => {
            setCountdown((v) => {
                const next = v -   divisor;
                if(next < 0){
                   if(loop) {
                       return iv;
                   }else{
                       stop();
                   }
                   return 0;
                }
                return next;
            });
            timer = setTimeout(next, divisor) as unknown as number;
        };
        next();
        return stop;
    }, [initialValue,divisor,loop]);
    return {
        countdown,
        start() {
            save?.(duration);
            setInitialValue(duration);
            setCountdown(duration);
        }
    }
}


export function useCountDownClick(duration: number, onClick?: ()=>Promise<any>,options ?: CountDownOptions) {
    const {countdown, start} = useCountdown(duration,options);
    const [loading, setLoading] = useState(false);
    const ing = countdown > 0 || loading;
    const callback = () => {
        if (ing) return;
        setLoading(true);
        if (onClick) {
            onClick().then(() => {
                start();
            }, () => {

            }).finally(() => {
                setLoading(false);
            })
        } else {
            setLoading(false);
            start();
        }
    };
    return [countdown,loading,callback] as const;
}
