import {FC, ReactNode} from "react";

export type BoxFrameProps = {
    children ?: ReactNode;
    className ?: string;
};

export const BoxFrame: FC<BoxFrameProps> = (props) => {
    const {children,className = ''} = props;
    return <div
        className={`rounded-md border border-neutral-300 overflow-hidden px-4 divide-y divide-neutral-300 text-sm ${className}`}>
        {children}
    </div>;
};
