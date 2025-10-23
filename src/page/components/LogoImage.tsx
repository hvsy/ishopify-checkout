import {FC} from "react";
import {useSrcSet} from "@hooks/useSrcSet.ts";

export type LogoImageProps = {
    url : string,
    width : number|string,
    height : number|string,
    alt ?: string;
    className ?: string;
};

export const LogoImage: FC<LogoImageProps> = (props) => {
    const {url,width,height,alt,className} = props;
    const srcSet = useSrcSet(url);
    return <img className={className}
                width={width}
                height={height} src={url} srcSet={srcSet} alt={alt}/>;
};
