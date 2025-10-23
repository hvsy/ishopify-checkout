import {Activity, ActivityProps, FC, useState} from "react";
import {usePaymentContext} from "../../../../container/PaymentContext.tsx";
import {Checkbox} from "@components/ui/checkbox.tsx";
import {BillAddress} from "./BillAddress.tsx";

export type BillingAddressStepProps = {};

export const BillingAddressStep: FC<BillingAddressStepProps> = (props) => {
    const {} = props;
    const [sameWithShippingAddress, setSameWithShippingAddress] = useState<boolean>(true);
    return <div className={'flex flex-col items-stretch justify-start'}>
        <div className={'flex flex-row space-x-2 items-center cursor-pointer px-3 pb-3'}>
            <Checkbox className={'size-5'} checked={sameWithShippingAddress}
                      id={'same_shipping_address'}
                      onCheckedChange={(e) => {
                          setSameWithShippingAddress(e !== false);
                      }}
            />
            <label htmlFor={'same_shipping_address'} className={'select-none cursor-pointer'}>
                Use shipping address as billing address
            </label>
        </div>
        {!sameWithShippingAddress && <BillAddress/>}
    </div>
};
