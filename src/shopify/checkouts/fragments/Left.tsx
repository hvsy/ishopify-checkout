import {FC, ReactNode,} from "react";
import {SingleCheckoutForm} from "./SingleCheckoutForm.tsx";
import {HighDemandCountDown} from "../../fragments/HighDemandCountDown.tsx";

export type LeftProps = {
    className ?: string;
    renderNav ?: (className ?: string)=>ReactNode;
};

export const Left: FC<LeftProps> = (props) => {
    return  <>
        <HighDemandCountDown />
        <div className={'flex flex-col space-y-10 flex-1'}>
            <SingleCheckoutForm />
        </div>
    </>;
};
