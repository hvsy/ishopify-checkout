import React, {FC, ReactNode, useEffect, useLayoutEffect, useRef, useState} from "react";

export type CollapsibleProps = {
    header ?: ReactNode;
    children ?: ReactNode;
    className?: string;
    render ?:()=>ReactNode;
    windowWidth?: number;
};

export const Collapsible: FC<CollapsibleProps> = (props) => {
    const {windowWidth,header,children,className,render} = props;
    const [open, setOpen] = useState(() => {
        return window.innerWidth >= 640;
    });
    // const {width} = useWindowSize({
    //     initializeWithValue : true,
    // });
    const final = open || (windowWidth||0) >= 640;
    return <details
                    open={final}
                    id={'summary-details'} className={`sm:max-w-[478px] appearance-none flex flex-col items-stretch ${className} group`}>
        {import.meta.env.VITE_SKELETON && <script dangerouslySetInnerHTML={{
            __html : `if(window.innerWidth >= 640){
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
            className={'select-none appearance-none cursor-pointer list-none [&::-webkit-details-marker]:hidden flex flex-col items-stretch  sm:hidden border-y py-3 relative'}>
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
            {(final || import.meta.env.VITE_SKELETON) ? (render ? render() :children) : null}
        </div>
    </details>;
};
