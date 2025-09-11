import {FC} from "react";
import {FacebookPixel} from "@components/pixels/FacebookPixel.tsx";

export type TrackingProps = {
    tracking : DB.Tracking,
};

export const Tracking: FC<TrackingProps> = (props) => {
    const {tracking} = props;

    return <>
        {!!(tracking.facebook?.length) && <FacebookPixel pixels={tracking.facebook} />}
    </>;
};
