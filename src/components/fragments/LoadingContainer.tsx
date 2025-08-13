import {FC, ReactNode} from "react";
import {isString as  _isString} from "lodash-es";
import {cn} from "@lib/cn.ts";

export type LoadingContainerProps = {
    loading : boolean;
    children : ReactNode;
    className ?: string;
    loadingClassName ?: string;
};

export const LoadingContainer: FC<LoadingContainerProps> = (props) => {
    const {loading,children,className = '',loadingClassName} = props;
    const content=  _isString(children) ? <span>{children}</span> : children;
    const final = cn("relative select-none",{
        "max-w-104" : !(className?.includes('max-w-')),
        // "lab" : true,
        "*:invisible [&>*:last-child]:visible":loading,
    },className);
    return <div className={final}>
            {content}
        {loading && <div className={`flex flex-row ustify-center items-center  visible absolute inset-0`} >
            <div className={`animate-pulse bg-slate-300 ${loadingClassName}`} />
        </div>}
    </div>
}
