import React, {FC, ReactNode} from "react";
import {isString as _isString} from "lodash-es";
import {Skeleton} from "../ui/Skeleton.tsx";
import {cn} from "@lib/cn.ts";

export type StepBlockProps = {
    label : ReactNode;
    labelClassName ?: string;
    extra ?: ReactNode;
    name : string;
    children ?: ReactNode;
    className ?: string;
};

export const StepBlock: FC<StepBlockProps> = (props) => {
    const {extra,children,label,labelClassName,name,className} = props;
    const lbClassName = cn("font-bold",labelClassName);
    if(import.meta.env.VITE_SKELETON){
        return <div className={`flex flex-col space-y-3 animate-pulse w-full ${className || ''}`}>
            <div className={'flex flex-row justify-between'}>
                {_isString(label) && <Skeleton className={'h-5 w-12'}/>}
                {_isString(extra) && <Skeleton className={'h-5 w-12'}/>}
            </div>
            {children}
        </div>
    }
    return <div className={`flex flex-col space-y-3 ${className || ''}`} data-name={name}>
        <div className={'flex flex-row justify-between'}>
            {_isString(label) ? <div className={lbClassName}>{label}</div> : label}
            {_isString(extra) ? <div>{extra}</div> : extra}
        </div>
        {children}
    </div>;
};
