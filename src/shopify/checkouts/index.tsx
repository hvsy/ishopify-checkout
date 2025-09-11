import {Right} from "./fragments/Right.tsx";
import {Left} from "./fragments/Left.tsx";
import {PageFrame} from "@components/frames/PageFrame.tsx";
import {Image} from "./fragments/Image.tsx";
import {BreadcrumbNavigator} from "@components/frames/BreadcrumbNavigator.tsx";
import {NavFrame} from "@components/frames/NavFrame.tsx";
import {useShopify} from "../context/ShopifyContext.ts";
import {useCallback} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {Report} from "../../page/components/Report.tsx";
import {useParams} from "react-router-dom";

export default () => {
    const shop = useShopify();
    const title = shop.title || shop.name;
    // const cart = useCartStorage();
    const nav = useCallback((className ?: string)=><NavFrame className={className}
                          title={title}
                          logo={shop?.brand?.logo && <Image {...shop.brand.logo} />}>
        {/*<BreadcrumbNavigator*/}
        {/*    basename={cart.basename}*/}
        {/*/>*/}
    </NavFrame>,[shop]);

    return <PageFrame
            renderNav={nav}
            renderRight={() => {
                return <ErrorBoundary onError={(error,info) => {
                    console.error(error,info);
                }} fallback={null}>
                    <Right/>
                </ErrorBoundary>
            }}
            renderLeft={() => {
                return <ErrorBoundary onError={(error,info) => {
                    console.error(error,info);
                }} fallback={null}>
                    <Left renderNav={nav}/>
                </ErrorBoundary>
            }}
        />
}
