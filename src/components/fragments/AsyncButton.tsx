import {FC, ReactNode} from "react";
import {useAsyncClick} from "@hooks/useAsyncClick.ts";
import {Loading} from "./Loading";
import {cn} from "@lib/cn";
import {isString as _isString} from "lodash-es";
import {Button} from "../ui/button.tsx";
import Big from "big.js";
import {Skeleton} from "../ui/Skeleton.tsx";

export type AsyncButtonProps =  {
    onClick ?: ()=>(Promise<any>|void);
    children ?: ReactNode,
    className ?: string;
    loadingClassName ?: string;
    loadingContainerClassName ?: string;
    pulsing ?: boolean;
} ;

export const AsyncButton : FC<AsyncButtonProps> = (props)=>{
    const {children,loadingContainerClassName = '',pulsing = false,className = '',loadingClassName = '',onClick,...others} = props;
    const [{loading : actionLoading},click]  = useAsyncClick(onClick);
    const finalLoading = pulsing || actionLoading;
    const final = cn("relative cursor-pointer select-none",{
        "max-w-104" : !(className?.includes('max-w-')),
        "lab" : true,
        "*:invisible [&>*:last-child]:visible":finalLoading,
        "min-w-24" : import.meta.env.VITE_SKELETON,
        "min-h-8" : import.meta.env.VITE_SKELETON,
    },className,{
        [loadingContainerClassName] : finalLoading,
    });
    if(import.meta.env.VITE_SKELETON){
        return <Skeleton className={final}/>
    }
    return <Button className={final} {...others} onClick={async (...args) => {
        if(pulsing) return;
        return click?.(...args);
    }}>
        {_isString(children) ? <span>{children}</span> : children}
        {actionLoading && <div className={'flex visible flex-col justify-center items-center absolute inset-0'}>
            <Loading className={loadingClassName}/>
        </div>}
        {pulsing && <div className={'animate-pulse absolute inset-0 flex visible items-stretch'}>
            <div className={"flex-1 bg-white opacity-75"} />
        </div>}
    </Button>;
};
