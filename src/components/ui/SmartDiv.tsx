import {FC, HTMLProps, ReactNode,} from "react";
import {Skeleton} from "./Skeleton.tsx";
import {isString} from "lodash-es";
import {cn} from "@lib/cn.ts";

export type SmartDivProps =HTMLProps<HTMLDivElement> & {
    className ?: string;
    children ?:ReactNode;
    loadingClassName ?: string;
};

export const SmartDiv: FC<SmartDivProps> = (props) => {
    const {className,children,loadingClassName,...others} = props;
    if(import.meta.env.VITE_SKELETON){
        const cls = cn({
            "h-5" : isString(children),
        },className,loadingClassName);
        return <Skeleton className={cls}>
            {/*{children}*/}
        </Skeleton>
    }
    return <div className={className} {...others}>
        {children}
    </div>;
};
