import {FC} from "react";
import {defaultDeviceSizes, useSrcSet} from "@hooks/useSrcSet.ts";

export type NewMediaProps = {
    width?:number;
    height?:number;
    url ?: string;
    thumbnail ?: string;
    auto ?: 'width' | 'height',
    priority ?: boolean;
    deviceSizes ?: number[];
    sizes ?: string;
    alt ?: string;
};

export const NewMedia: FC<NewMediaProps> = (props) => {
    const {priority,width,height,url,thumbnail,auto = 'height',deviceSizes = defaultDeviceSizes,sizes,alt = ''} = props;
    const style : any = auto == 'width' ? {
        width : 'auto',maxHeight:'100%',
    } : {
        maxWidth : '100%',
        height : 'auto',
    }
    const maxWidth = typeof width === 'number' && width > 0 ? width : undefined;
    const srcSet = useSrcSet(url,deviceSizes,maxWidth);
    return <img src={thumbnail || url}
                draggable={false}
                loading={priority ? 'eager' : 'lazy'}
                srcSet={srcSet}
                sizes={sizes}
                style={style}
                width={width}
                height={height}
                alt={alt}
    />;
};
