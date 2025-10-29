import {FC, useEffect, useRef} from "react";
import {AddressForm} from "../../../../page/fragments/Checkout/forms/AddressForm.tsx";
import {useCurrentForm} from "../../../../container/FormContext.ts";
import {pick as _pickBy} from "lodash-es";
import {useAllZones} from "../../../../container/PaymentContext.tsx";

export type BillAddressProps = {};

export const BillAddress: FC<BillAddressProps> = (props) => {
    const {} = props;
    const form = useCurrentForm();
    const mountedRef = useRef(false);
    useEffect(() => {
        if(mountedRef.current) return;
        mountedRef.current = true;
        const shipping = form.getFieldValue(['shipping_address']);
        const keys = [
            'region_code',
            'state_code',
            'first_name',
            'last_name',
            'line1',
            'line2',
            'city',
            'zip',
        ];
        const after = _pickBy(shipping,keys);
        form.setFieldValue('billing_address',after);
        return () => {
            mountedRef.current = false;
            form.setFieldValue('billing_address',null);
        }
    }, []);
    const {zones,loading} = useAllZones();
    return <div className={'flex flex-col items-stretch px-3 pb-4'}>
        <AddressForm title={'Billing'}
                     zones={zones}
                     loading={loading}
                     hidden_fields={['phone',]}
                     prefix={['billing_address']}></AddressForm>
    </div>
};
