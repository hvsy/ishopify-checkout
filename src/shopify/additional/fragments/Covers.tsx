import {FC, lazy} from "react";

export type CoversProps = any;

const Images = lazy(async() => {
    const m = await import("./Images.tsx");
    return {
        default : m.Images,
    }
})

export const Covers: FC<CoversProps> = (props) => {
    return <Images {...props}/>;
};
