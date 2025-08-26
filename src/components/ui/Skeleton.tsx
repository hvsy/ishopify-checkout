import {FC, ReactNode} from "react";

export type SkeletonProps = {
    children ?: ReactNode;
    className ?: string;
};

export const Skeleton: FC<SkeletonProps> = (props) => {
    const {children,className} = props;
    return <div className={`animate-pulse bg-gray-300 rounded overflow-hidden ${className || ''}`}>
        {children}
    </div>;
};
