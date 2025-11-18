import {CSSProperties, FC, ReactNode} from "react";
import {isString as  _isString,isFunction as _isFunction} from "lodash-es";
import {cn} from "@lib/cn.ts";

export type LoadingContainerProps = {
    loading : boolean;
    children : ReactNode|((loading : boolean)=>ReactNode);
    className ?: string;
    loadingClassName ?: string;
    loadingContainerClassName ?: string;
    style ?: CSSProperties;
};

export const LoadingContainer: FC<LoadingContainerProps> = (props) => {
    const {loading,style,children,loadingContainerClassName = '',className = '',loadingClassName} = props;
    const content=  _isString(children) ? <span>{children}</span> : (_isFunction(children) ?children(loading) :children);
    const final = cn("relative select-none",{
        "max-w-104" : !(className?.includes('max-w-')),
        // "lab" : true,
        "*:invisible [&>*:last-child]:visible":loading,
    },className);
    return <div className={final} style={style}>
            {content}
        {loading && <div className={cn(`flex flex-row justify-center items-center  visible absolute inset-0`,loadingContainerClassName)} >
            <div className={`animate-pulse bg-slate-300 ${loadingClassName}`} />
        </div>}
    </div>
}
