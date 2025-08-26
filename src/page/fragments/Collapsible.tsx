import React, {FC, ReactNode, useLayoutEffect, useState} from "react";

export type CollapsibleProps = {
    header ?: ReactNode;
    children ?: ReactNode;
    className?: string;
    render ?:()=>ReactNode;
};

export const Collapsible: FC<CollapsibleProps> = (props) => {
    const {header,children,className,render} = props;
    const [open, setOpen] = useState(false);
    useLayoutEffect(() => {
        setOpen(window.screen.availWidth >= 640);
    }, []);
    return <details id={'summary-details'} className={`sm:max-w-[478px] appearance-none flex flex-col items-stretch ${className} group`}
                    open={open}>
        {import.meta.env.VITE_SKELETON && <script dangerouslySetInnerHTML={{
            __html : `if(window.screen.availWidth >= 640){
            document.getElementById('summary-details').setAttribute('open',true);
        }else{
            document.getElementById('summary-details').removeAttribute('open');
        }`
        }} />}
        <summary
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOpen(!open)
            }}
            className={'appearance-none list-none [&::-webkit-details-marker]:hidden flex items-center flex-row justify-between sm:hidden border-y border-neutral-300 p-6 relative'}>
            {header}
        </summary>
        <div
            className={`border-neutral-300
                box-border
                max-h-0
                sm:max-h-fit
                origin-top
                overflow-hidden
                sm:overflow-visible
                sm:!border-b-0
                group-open:overflow-visible
                group-open:border-b
                group-open:max-h-[1000px]
                transition
                ease-linear
                duration-300
            `} style={{
            transitionProperty: 'max-height'
        }}>
            {(open || import.meta.env.VITE_SKELETON) ? (render ? render() :children) : null}
        </div>
    </details>;
};
