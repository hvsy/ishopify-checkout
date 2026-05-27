import {FC, useEffect,} from "react";
import {FacebookPixel} from "@components/pixels/FacebookPixel.tsx";
import {TiktokPixel} from "@components/pixels/TiktokPixel.tsx";
import {NewsbreakPixel} from "@components/pixels/NewsbreakPixel.tsx";
import {SnapchatPixel} from "@components/pixels/SnapchatPixel.tsx";
import {getMetaContent} from "@lib/metaHelper.ts";
import {getShopifyS, getShopifyY} from "@lib/shopify.ts";
import Clarity from "@microsoft/clarity";

export type PixelsProps = {
    tracking : any;
    regex ?: string[];
    sy ?: string;
};

const Platforms : any = {
    facebook : FacebookPixel,
    tiktok : TiktokPixel,
    newsbreak : NewsbreakPixel,
    snapchat : SnapchatPixel,
}
export const Pixels: FC<PixelsProps> = (props) => {
    const {tracking,regex,sy} = props;
    useEffect(() => {
        const id = getMetaContent("clarity");
        if(!!id){
            Clarity.init(id);
            let csy = sy;
            if(!csy){
                csy = getShopifyY();
            }
            const css = getShopifyS();
            if(!!csy){
                if(!!css){
                    Clarity.identify(csy,css);
                }else{
                    Clarity.identify(csy)
                }
            }
        }
    }, []);
    const platforms = Object.keys(tracking).map((key) => {
        const pixels = tracking[key];
        const Component = Platforms[key];
        if(Component && !!pixels && pixels.length > 0){
            return <Component pixels={pixels} key={key} regex={regex} sy={sy}/>
        }
        return null;
    }).filter(Boolean);
    return <>
        {platforms}
    </>;
};
