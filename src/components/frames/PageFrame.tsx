import {FC, ReactNode} from "react";
import {Frame} from "./Frame.tsx";
import {SiteNav} from "../../shopify/fragments/SiteNav.tsx";

export type PageFrameProps = {
    renderRight?: () => ReactNode;
    renderLeft?: () => ReactNode;
};

export const PageFrame: FC<PageFrameProps> = (props) => {
    const {renderRight, renderLeft,} = props;
    return <Frame header={<SiteNav />}
                  right={renderRight?.()}
    >
        {renderLeft?.()}
    </Frame>;
};
