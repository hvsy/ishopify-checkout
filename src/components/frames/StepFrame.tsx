import {FC, ReactNode} from "react";

export type StepFrameProps = {
    title : string;
    description ?: string;
    children ?: ReactNode;
};

export const StepFrame: FC<StepFrameProps> = (props) => {
    const {title,children,description} = props;
    return <div className={'space-y-3'}>
        <div>
            {title}
        </div>
        {(!!description) && <div className={'text-sm text-slate-500'}>
            {description}
        </div>}
        {children}
    </div>;
};
