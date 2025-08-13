import {FC, ReactNode} from "react";
import {Default} from "@hooks/client.ts";
import {Nav} from "../../page/fragments/Nav.tsx";

export type LeftFrameProps = {
    renderFooter ?: ()=>ReactNode;
    children ?: ReactNode;
    className?:string;
};

export const LeftFrame: FC<LeftFrameProps> = (props) => {
    const {renderFooter,children,className} = props;
    return <div className={`flex flex-col flex-1 items-stretch space-y-6 sm:max-w-[638px] ${className}`}>
        <Default>
            <Nav className={'hidden sm:flex'}/>
        </Default>
        <div className={'flex flex-col space-y-10 flex-1'}>
            {children}
        </div>
        <div className={'pb-10 text-default-500 text-sm'}>
            {renderFooter?.()}
            {/*All rights reserved {shop.title || shop.name}*/}
        </div>
    </div>
};
