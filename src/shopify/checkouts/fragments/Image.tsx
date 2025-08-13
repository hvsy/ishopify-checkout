import {FC} from "react";
import {Media} from "../../../page/components/Media.tsx";

export type ImageProps = {
    height : number;
    width : number;
    src : string;
    id : string;
};

export const Image: FC<ImageProps> = (props) => {
    const {height,width,src} = props;
    if(!src) return null;
    return <Media
        media={{
            url : src,
            width,
            height,
        }}
    />;
};
