import {FC, ReactNode,} from "react";
import {SingleCheckoutForm} from "./SingleCheckoutForm.tsx";
import {HighDemandCountDown} from "../../fragments/HighDemandCountDown.tsx";
import {Features} from "@lib/flags.ts";

export type LeftProps = {
    className ?: string;
    renderNav ?: (className ?: string)=>ReactNode;
};

const ShowDowncount = Features.includes('countdown');
export const Left: FC<LeftProps> = (props) => {
    return  <>
        {ShowDowncount && <HighDemandCountDown />}
        <div className={'flex flex-col space-y-10 flex-1'}>
            <SingleCheckoutForm />
        </div>
    </>;
};
