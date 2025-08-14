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
    return <Frame header={
        renderNav? <Mobile>
            {renderNav("flex sm:hidden mb-3")}
        </Mobile> :null
    }
                  right={renderRight?.()}
                  rightBottom={<DesktopCheckoutBoard/>}
    >
        {renderLeft?.()}
    </Frame>;
};
