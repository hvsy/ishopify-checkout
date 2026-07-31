import {FC} from "react";
import {getMetaContent} from "@lib/metaHelper.ts";
import {getGlobalPath} from "../lib/globalSettings.ts";
import {NavFrame} from "@components/frames/NavFrame.tsx";
import {LogoImage} from "../../page/components/LogoImage.tsx";

export const SiteNav: FC<any> = (props: any) => {
    const {className = ''} = props;
    const title = getMetaContent('shop_title');
    const profileLogo = getGlobalPath('profile.logo', null);
    const image = profileLogo?.resource?.image;
    const logo = image?.url ? {
        url: image.url,
        width: image?.width + 'px',
        height: image?.height + 'px',
    } : null;
    // NavFrame 里 logo 容器 max-h-[64px]，所以实际渲染宽度不会超过 min(原图宽, 64 * 宽高比)
    const logoWidth = parseFloat(String(image?.width));
    const logoHeight = parseFloat(String(image?.height));
    const logoSize = Number.isFinite(logoWidth) && Number.isFinite(logoHeight) && logoHeight > 0
        ? Math.min(logoWidth, 64 * logoWidth / logoHeight)
        : undefined;
    return <NavFrame className={`${className}`}
                     title={title}
                     align={(profileLogo?.align || undefined) as string}
                     logo={logo ? <LogoImage {...logo}
                                             sizes={logoSize ? `${logoSize}px` : undefined}
                                             style={{
                                                 width: 'auto',
                                                 maxHeight: '100%',
                                             }}
                                             className={'object-contain'}/> : null}>
    </NavFrame>;
};
