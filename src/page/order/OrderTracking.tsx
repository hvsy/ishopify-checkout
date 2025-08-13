import {FC, lazy} from "react";
import {LazyRender} from "@components/fragments/LazyRender.tsx";

// import {Tracking} from "../components/Tracking.tsx";

const Tracking = lazy(async () => {
    const m = await import('../components/Tracking');
    return {
        default : m.Tracking,
    }
})
export type OrderTrackingProps = {
    data : DB.Order,
    action ?: string;
};

export const OrderTracking: FC<OrderTrackingProps> = (props) => {
    const {data,action} = props;
    const tracking = data?.shop?.preference?.tracking;
    if(!tracking || action !== 'thank-you') return null;
    return <LazyRender
        render={() => {
            return <Tracking tracking={tracking} />
        }}
    />
};
