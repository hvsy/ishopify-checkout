import {FC, ReactNode} from "react";

export type DividerProps = {
    children?: ReactNode;
};

export const Divider: FC<DividerProps> = (props) => {
    const {children} = props;
    return <div className={'flex flex-row items-center space-x-5'}>
        <div  className={'flex-1 border-t-[1px] border-[#d9d9d9]'}/>
        {children}
        <div  className={'flex-1 border-t-[1px] border-[#d9d9d9]'}/>
    </div>;
};
