import React, {FC, ReactNode} from "react";
import {Collapsible} from "../../page/fragments/Collapsible.tsx";
import {ChevronDown, ShoppingCart} from "lucide-react";
import {Skeleton} from "../ui/Skeleton.tsx";

export type RightFrameProps = {
    className?: string;
    children?: ReactNode;
    renderFooter ?: ()=>ReactNode;
    totalPrice?: ReactNode;
};

export const RightFrame: FC<RightFrameProps> = (props) => {
    const {className, children, renderFooter, totalPrice} = props;
    return <Collapsible
        className={className}
        header={
            <>
            {import.meta.env.VITE_SKELETON ? <Skeleton className={'min-h-8 min-w-36'} /> :<div className={'flex flex-row items-center space-x-2 text-blue-500'}>
                    <div>
                        <ShoppingCart size={18}/>
                    </div>
                    <div className={'flex flex-row space-x-3 items-center'}>
                        <div className={'text-base'}>
                            <span className={'group-open:hidden'}>Show order summary</span>
                            <span className={'hidden group-open:inline'}>Hide order summary</span>
                        </div>
                        <div className={'group-open:-rotate-180 duration-300'}>
                            <ChevronDown size={16}/>
                        </div>
                    </div>
                </div>}
                {import.meta.env.VITE_SKELETON ? <Skeleton className={'min-w-18 min-h-5 max-h-5'}/>:<div className={'font-bold'}>
                    {totalPrice}
                </div>}
            </>
        } render={() => {
        return <div
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
                duration-300
            `} style={{
            transitionProperty: 'max-height'
        }}>
            <div className={'flex flex-col divide-y divide-neutral-200 items-stretch p-6 sm:p-0'}>
                {children}
                {renderFooter?.()}
            </div>
        </div>
    }}/>;
};
