import {useRef} from "react";

export type MergeParamsCallback<T> = (oldValues : T,newValues : T)=>T;
export function createMergeDebounced<T>(fn : (values : T)=>any, { wait = 100, mergeParams  } : {wait :number,mergeParams : MergeParamsCallback<T>}) {
    let timeoutId : any|null = null;
    let mergedParams : T|null= null;

    return function callWithMerge(params : any) {
        // 第一次调用，初始化 mergedParams
        if (mergedParams === null) {
            mergedParams = params;
        } else {
            // 合并传入的参数
            mergedParams = mergeParams(mergedParams, params);
        }

        // 清除之前的计时器
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // 重置计时器
        timeoutId = setTimeout(() => {
            // 最终执行目标函数
            fn(mergedParams!);
            // 清空状态
            mergedParams = null;
            timeoutId = null;
        }, wait);
    };
}

export function useMergeDebounced<T>(fn : (values : T)=>any, wait : number, mergeParams : MergeParamsCallback<T> ) {
    const debouncedRef = useRef<ReturnType<typeof createMergeDebounced<T>>>(null);
    if (!debouncedRef.current) {
        debouncedRef.current = createMergeDebounced(fn, { wait, mergeParams });
    }
    return debouncedRef.current;
}
