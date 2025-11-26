import {FC, lazy} from "react";

export type PixelsProps = {
    tracking : any;
};

const Platforms : any = {
    'facebook' : lazy(async() => {
        const m = await import("@components/pixels/FacebookPixel.tsx");
        return {
            default : m.FacebookPixel,
        }
    }),
    'tiktok' : lazy(async () => {
        const m = await import("@components/pixels/TiktokPixel.tsx");
        return {
            default : m.TiktokPixel,
        }
    }),
    'newsbreak' : lazy(async () => {
        const m = await import("@components/pixels/NewsbreakPixel");
        return {
            default : m.NewsbreakPixel,
        }
    })
}
export const Pixels: FC<PixelsProps> = (props) => {
    const {tracking} = props;
    const platforms = Object.keys(tracking).map((key) => {
        const pixels = tracking[key];
        const Component = Platforms[key];
        if(Component && !!pixels && pixels.length > 0){
            return <Component pixels={pixels} key={key}/>
        }
        return null;
    }).filter(Boolean);
    return <>
        {platforms}
    </>;
};
