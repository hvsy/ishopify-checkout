import {CSSProperties, FC} from "react";
import {useSrcSet} from "@hooks/useSrcSet.ts";

export type LogoImageProps = {
    url : string,
    width : number|string,
    height : number|string,
    alt ?: string;
    className ?: string;
    style ?: CSSProperties,
};

export const LogoImage: FC<LogoImageProps> = (props) => {
    const {url,width,height,alt,style,className} = props;
    const srcSet = useSrcSet(url);
    return <img className={className}
                style={style}
                width={width}
                height={height} src={url} srcSet={srcSet} alt={alt}/>;
};
