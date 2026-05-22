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
    return <NavFrame className={`${className}`}
                     title={title}
                     align={(profileLogo?.align || undefined) as string}
                     logo={logo ? <LogoImage {...logo}
                                             style={{
                                                 width: 'auto',
                                                 maxHeight: '100%',
                                             }}
                                             className={'object-contain'}/> : null}>
    </NavFrame>;
};
