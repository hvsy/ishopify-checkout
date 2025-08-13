import {FC} from "react";

export type PaymentHolderProps = any;

export const PaymentHolder: FC<PaymentHolderProps> = (props) => {
    const {} = props;
    return <div>
        {JSON.stringify(props,null,4)}
    </div>;
};
