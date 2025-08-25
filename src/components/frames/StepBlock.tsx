import React, {FC, ReactNode} from "react";
import {isString as _isString} from "lodash-es";

export type StepBlockProps = {
    label : ReactNode;
    extra ?: ReactNode;
    name : string;
    children ?: ReactNode;
};

export const StepBlock: FC<StepBlockProps> = (props) => {
    const {extra,children,label,name} = props;
    return <div className={'flex flex-col space-y-3'} data-name={name}>
        <div className={'flex flex-row justify-between'}>
            {_isString(label) ? <div>{label}</div> : label}
            {_isString(extra) ? <div>{extra}</div> : extra}
        </div>
        {children}
    </div>;
};
