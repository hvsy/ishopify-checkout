import {Right} from "./fragments/Right.tsx";
import {Left} from "./fragments/Left.tsx";
import {PageFrame} from "@components/frames/PageFrame.tsx";
import {NavFrame} from "@components/frames/NavFrame.tsx";
import {useShopify} from "../context/ShopifyContext.ts";
import {useCallback} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {getGlobalPath, getGlobalSettings} from "../lib/globalSettings.ts";
import {LogoImage} from "../../page/components/LogoImage.tsx";


export default () => {
    const shop = useShopify();
    const title = shop.title || shop.name;
    const nav = useCallback((className ?: string)=>{
        const profileLogo = getGlobalPath('profile.logo',null);
        const image = profileLogo?.resource?.image;
        const logo = image?.url ? {
                url : image.url,
                width : image?.width,
                height : image?.height,
        } : null;
        return <NavFrame className={className}
                         title={title}
                         align={(profileLogo?.align || undefined) as string}
                         logo={logo ?  <LogoImage {...logo}
                             width={'auto'}
                                                  height={'100%'}
                                                  className={'object-contain'}/> : null}>
        </NavFrame>;
    },[shop]);

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
