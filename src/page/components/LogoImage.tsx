import {CSSProperties, FC} from "react";
import {useSrcSet} from "@hooks/useSrcSet.ts";

export type LogoImageProps = {
    url : string,
    width : number|string,
    height : number|string,
    alt ?: string;
    className ?: string;
    style ?: CSSProperties,
    sizes ?: string;
};

export const LogoImage: FC<LogoImageProps> = (props) => {
    const {url,width,height,alt,style,className,sizes} = props;
    const numericWidth = typeof width === 'number' ? width : parseFloat(width);
    const maxWidth = Number.isFinite(numericWidth) && numericWidth > 0 ? numericWidth : undefined;
    const srcSet = useSrcSet(url, undefined, maxWidth);
    return <img className={className}
                style={style}
                width={width}
                height={height} src={url} srcSet={srcSet} sizes={sizes} alt={alt}/>;
};
