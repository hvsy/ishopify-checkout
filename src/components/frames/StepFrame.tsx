import {FC, ReactNode} from "react";
import {Skeleton} from "../ui/Skeleton.tsx";

export type StepFrameProps = {
    title : string;
    description ?: string;
    children ?: ReactNode;
};

export const StepFrame: FC<StepFrameProps> = (props) => {
    const {title,children,description} = props;
    if(import.meta.env.VITE_SKELETON){
        return <div className={'space-y-3 animate-pulse w-full'}>
            <Skeleton className={'h-5 w-12'}/>
            {!!description && <Skeleton className={'h-3 w-24'} />}
            {!!children && <Skeleton className={'h-24 w-full'}/>}
        </div>
    }
    return <div className={'space-y-3'}>
        <div className={'font-bold'}>
            {title}
        </div>
        {(!!description) && <div className={'text-sm text-slate-500'}>
            {description}
        </div>}
        {children}
    </div>;
};
