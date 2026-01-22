import {FC, ReactNode} from "react";
import {PaypalSvg} from "../../../../../assets/paypal.tsx";
import {flatten as _flatten,isArray as _isArray,isString as _isString} from "lodash-es";
import {PaymentTip} from "./PaymentTip.tsx";
import {EmbedInFrame} from "./EmbedInFrame.tsx";
import {cn} from "@lib/cn.ts";
import {BillingAddressStep} from "../../../../../shopify/checkouts/steps/BillingAddressStep";

export type PaymentProps = {
    method : DB.PaymentMethod,
    checked : boolean;
    children ?: ReactNode;
    token : string;
};


const Icons : any = {
    "paypal" : [PaypalSvg],
    "credit-card" : {
        "visa" : 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/visa.sxIq5Dot.svg',
        "master": ['https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/mastercard.1c4_lyMp.svg',],
        "amex" :'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/amex.Csr7hRoy.svg',
        "jcb" : 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/jcb.BgZHqF0u.svg',
    },
};

// export const PaymentProviders : any = {
//     "AsiaBill" : AsiaBill,
// }
export const Payment: FC<PaymentProps> = (props) => {
    const {method,token,checked,children} = props;
    const title = {
        "paypal" : "Paypal",
        "credit-card" : "Credit / Debit Card",
    }[method.type];
    const logo = null;//Logos[method.type] || null;
    let icons = _flatten((method.icons||[]).map(i=>{
        return Icons[method.type][i];
    }));
    if(icons.length === 0){
        const target = Icons[method.type];
        icons = _flatten(_isArray(target) ? target : Object.values(target));
    }
    return  <div className={'flex flex-col flex-1 items-stretch divide-neutral-300 divide-y cursor-pointer select-none'}>
        <div className={'flex flex-row px-3 space-x-3 py-3'}>
            <div className={'flex flex-col justify-center'}>
                {children}
            </div>
            <div key={method.id} className={'flex flex-1 flex-row justify-between items-center'}>
                    {logo ?
                        <div className={"border-neutral-300 border overflow-hidden rounded px-1"}>
                            <div className={'flex flex-col'}>
                                {logo}
                            </div>
                            {/*<img className="object-cover h-7 w-12" src={method.logo}/>*/}
                        </div> : <div className={'text-sm text-nowrap'}>
                            {title}
                        </div>}
                <div className={'flex flex-row space-x-1'}>
                    {(icons || []).map((icon, i) => {
                        return <div className={'rounded flex flex-col justify-center items-center overflow-hidden'} key={i}>
                            {_isString(icon) ? <img width={38} height={24} className="object-cover overflow-hidden" src={icon}/> : icon }
                        </div>
                    })}
                </div>
            </div>
        </div>
        <div className={cn('p-0 flex flex-col justify-start items-stretch ',{
            'hidden' : !checked,
            'bg-[#F5F5F5]'  : method.type === 'credit-card',
        })}>
            <div className={'flex flex-col'}>
                {
                    (function (mode) {
                        switch (mode) {
                            case 'popup':
                            case 'redirect': {
                                return <PaymentTip/>
                            }
                            case 'embed-in': {
                                return <EmbedInFrame
                                    active={checked}
                                    id={method.channel}
                                    height={method.height || 145}
                                    width={'100%'}
                                    name={method.channel}
                                    src={method.embed || `/a/s/api/checkouts/${token}/gateway/${method.id}/embed`}
                                    // src={`/a/s/api/gateway/${method.id}/embed`}
                                />
                            }
                            default:
                                return mode;
                        }
                        return null;
                    })(method.mode)
                }
            </div>
            {method.type === 'credit-card' && checked && <BillingAddressStep />}
        </div>
    </div>;
};
