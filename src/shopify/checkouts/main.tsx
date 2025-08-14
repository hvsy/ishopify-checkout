import {Right} from "./fragments/Right.tsx";
import {Left} from "./fragments/Left.tsx";
import {PageFrame} from "@components/frames/PageFrame.tsx";
import {Image} from "./fragments/Image.tsx";
import {BreadcrumbNavigator} from "@components/frames/BreadcrumbNavigator.tsx";
import {getBasename} from "@lib/checkout.ts";
import {NavFrame} from "@components/frames/NavFrame.tsx";
import {useShopify} from "../context/ShopifyContext.ts";
import {useCallback} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {useSummary} from "./hooks/useSummary.ts";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";

export default () => {
    const shop = useShopify();
    const title = shop.title || shop.name;
    const cart = useCartStorage();
    const nav = useCallback((className ?: string)=><NavFrame className={className}
                          title={title}
                          logo={shop?.brand?.logo && <Image {...shop.brand.logo} />}>
        <BreadcrumbNavigator
            basename={cart.basename}
        />
    </NavFrame>,[shop]);
    const {json} = useSummary();
    const checkout  = getCheckoutFromSummary(json,'cart');
    return <FormContainer initialValues={checkout} key={checkout.countryCode}>
        <PageFrame
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
    </FormContainer>
}
