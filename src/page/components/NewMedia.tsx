import {FC} from "react";
import {defaultDeviceSizes, useSrcSet} from "@hooks/useSrcSet.ts";

export type NewMediaProps = {
    width?:number;
    height?:number;
    url ?: string;
    auto ?: 'width' | 'height',
    priority ?: boolean;
    deviceSizes ?: number[];
};

export const NewMedia: FC<NewMediaProps> = (props) => {
    const {priority,width,height,url,auto = 'height',deviceSizes = defaultDeviceSizes} = props;
    const style : any = auto == 'width' ? {
        width : 'auto',maxHeight:'100%',
    } : {
        maxWidth : '100%',
        height : 'auto',
    }
    const srcSet = useSrcSet(url,deviceSizes);
    return <img src={url}
                draggable={false}
                loading={priority ? 'eager' : 'lazy'}
                srcSet={srcSet}
                style={style}
                width={width}
                height={height}
    />;
};
