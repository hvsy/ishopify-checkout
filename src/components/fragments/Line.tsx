import React, {FC, ReactNode} from "react";

export type LineProps = {
    className ?: string;
    prefix ?: ReactNode;
    suffix ?: ReactNode;
    children ?: ReactNode;
};

export const Line: FC<LineProps> = (props) => {
    const {className = '',prefix,children,suffix} = props;
    return <div className={`flex flex-row items-stretch ${className}`}>
        {prefix && <div className={'flex flex-col justify-center'}>{prefix}</div>}
        {children}
        {suffix && <div className={'flex flex-col justify-center'}>{suffix}</div>}
    </div>
};
