import {FC, ReactNode} from "react";
import {Mobile} from "@hooks/client.ts";
import {DesktopCheckoutBoard} from "../../plugins/DesktopCheckoutBoard.tsx";
import {Frame} from "./Frame.tsx";

export type PageFrameProps = {
    renderRight?: () => ReactNode;
    renderLeft?: () => ReactNode;
    renderNav ?: (className?:string)=>ReactNode;
};

export const PageFrame: FC<PageFrameProps> = (props) => {
    const {renderRight, renderLeft,renderNav} = props;
    let top = null;
    if(renderNav){
        if(import.meta.env.VITE_SKELETON){
            top = renderNav("flex sm:hidden mb-3");
        }else{
            top = <Mobile>
                {renderNav?.("flex sm:hidden mb-3")}
            </Mobile>;
        }
    }
    return <Frame header={top}
                  right={renderRight?.()}
                  rightBottom={<DesktopCheckoutBoard/>}
    >
        {renderLeft?.()}
    </Frame>;
};
