import {FC, FunctionComponent, ReactNode} from "react";

export type SingleFormFrameProps = {
    ChildrenComponents : {
        [index : string] : FunctionComponent
    };
    children ?: ReactNode;
};

export const SingleFormFrame: FC<SingleFormFrameProps> = (props) => {
    const {ChildrenComponents,children} = props;
    return <div className={'flex flex-col space-y-8 items-stretch'}>
        {Object.keys(ChildrenComponents).map((key) => {
            const Component = ChildrenComponents[key];
            return <div className={'flex flex-col items-stretch space-y-6'} key={key}>
                <Component key={key}/>
            </div>
        })}
        {children}
    </div>;
};
