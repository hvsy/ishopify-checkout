import {FC} from "react";
import {useLoaderData} from "react-router-dom";
import {startCase as _startCase} from "lodash-es";
import {AsiaBill} from "./AsiaBill.tsx";
import {PaymentHolder} from "./PaymentHolder.tsx";

export type PaymentProviderProps = {};

export const Payments : any = {
    AsiaBill
};
export const PaymentProvider: FC<PaymentProviderProps> = (props) => {
    const {} = props;
    const embed = useLoaderData() as DB.EmbedProvider;
    const {channel,data} = embed;
    const Provider = _startCase(channel).replace(' ','');
    const Component = Payments[Provider];
    if(Component){
        return <Component {...data} />
    }
    return <PaymentHolder {...embed}/>;
};
