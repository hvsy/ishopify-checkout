import {FC} from "react";
import {get as _get, startsWith as _startsWith} from "lodash-es";
import {shopify_payment} from "../../lib/payment.ts";
import {StandardFooterNavFrame} from "@components/frames/StandardFooterNavFrame.tsx";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useUpdateContactInformation} from "../hooks/useUpdateContactInformation.ts";


export type CheckoutFooterProps = {
    checkout : any;
};

export const CheckoutFooter: FC<CheckoutFooterProps> = (props) => {
    const {checkout} = props;
    const sync = useCheckoutSync();
    const fn = useUpdateContactInformation();
    return <StandardFooterNavFrame actions={{
        information : {
            async submit(values){
                console.log('submit values:',values,checkout);
                const shipping = (values?.shipping_address || checkout.shipping_address) ;
                let prefix = _get(shipping,'region.data.phoneNumberPrefix');
                // if(prefix && !_startsWith(prefix,'+')){
                //     prefix =  `+${prefix}`;
                // }
                const phone = _get(shipping,'phone');
                const json = {
                    id : checkout.shipping_address_id || "gid://shopify/CartSelectableAddress/0",
                    create : !checkout.shipping_address_id,
                    // buyerIden
                    buyerIdentity : {
                        email : _get(values,'email'),
                        countryCode : _get(shipping,'region.code'),
                    }  ,
                    delivery  : {
                        address1 : _get(shipping,'line1'),
                        address2 : _get(shipping,'line2'),
                        city : _get(shipping,'city'),
                        countryCode: _get(shipping,'region.code'),
                        firstName: _get(shipping,'first_name'),
                        lastName: _get(shipping,'last_name'),
                        phone: phone ? ((_startsWith(phone,'+') ? phone: `+${prefix||''}${phone}`)) : null,
                        provinceCode: _get(shipping,'state.code',null),
                        zip : _get(shipping,'zip',null),
                    }
                };
                console.log('update shipping address:',json);
                await fn({
                    variables : json,
                });
                await sync();
            }
        },
        shipping : {
            async submit(values) {
                console.log('shipping values:',values);
                await sync();
            }
        },
        payment : {
            async submit(values,action,method) {
                const {request : data}= (await sync()) || {};
                const result = await shopify_payment({
                    summary : data,
                    values,
                    method : method!,
                })
                console.log(result);
            }
        },

    }}
    />;
};
