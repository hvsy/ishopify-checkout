import {FC, ReactNode} from "react";
import {useAsyncClick} from "@hooks/useAsyncClick.ts";
import {Loading} from "./Loading";
import {cn} from "@lib/cn";
import {isString as _isString} from "lodash-es";
import {Button} from "../ui/button.tsx";

export type AsyncButtonProps =  {
    onClick ?: ()=>(Promise<any>|void);
    children ?: ReactNode,
    className ?: string;
    loadingClassName ?: string;
} ;

export const AsyncButton : FC<AsyncButtonProps> = (props)=>{
    const {children,className = '',loadingClassName = '',onClick,...others} = props;
    const [{loading},click]  = useAsyncClick(onClick);
    const final = cn("relative cursor-pointer select-none",{
        "max-w-104" : !(className?.includes('max-w-')),
        "lab" : true,
        "*:invisible [&>*:last-child]:visible":loading,
    },className);
    return <Button className={final} {...others} onClick={click}>
        {_isString(children) ? <span>{children}</span> : children}
        {loading && <div className={'flex visible flex-col justify-center items-center absolute inset-0'}>
            <Loading className={loadingClassName}/>
        </div>}
    </Button>;
};
