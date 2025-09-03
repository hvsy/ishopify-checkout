import React, {FC, memo} from "react";
import {cn} from "@lib/cn";

export type SwatchProps = {
    active: boolean;
    onClick?: () => void;
    className?: string;
    value?: any;
    children?: React.ReactNode;
    disabled?: boolean;
};

export const Swatch: FC<SwatchProps> = memo((props) => {
    const {active, value, disabled = true, onClick, className} = props;
    const finalClassName = cn(
        `rounded-full select-none border border-gray-200 min-w-[48px] relative overflow-hidden py-1 px-4 flex flex-col justify-center items-center`,
        {
            'ring ring-blue-500': active,
            'text-gray-400 cursor-not-allowed ': disabled,
            'before:absolute before:inset-x-0 before:-z-10 origin-center before:h-px before:-rotate-45 before:bg-neutral-300 before:transition-transform  before:dark:bg-neutral-700': disabled,
            'cursor-pointer ': !disabled,
        },className);
    return <div className={finalClassName} onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            onClick?.();
        }
    }}>
        {value}
    </div>
});
