import {FC, ReactNode} from "react";
import {PaypalSvg} from "../../../../../assets/paypal.tsx";
import {flatten as _flatten,isArray as _isArray,isString as _isString} from "lodash-es";
import {PaymentTip} from "./PaymentTip.tsx";
import {EmbedInFrame} from "./EmbedInFrame.tsx";
import {cn} from "@lib/cn.ts";
import {BillingAddressStep} from "../../../../../shopify/checkouts/steps/BillingAddressStep";
import {Discover} from "../../../../../assets/discover.tsx";
import {PaypalCard} from "../../../../../payments/PaypalCard.tsx";
import {getFinalPath, getReplacePathBase} from "@lib/api.ts";
import {useScreen} from "usehooks-ts";
import {Tooltip} from "@components/fragments/Tooltip.tsx";

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
        "mastercard": 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/mastercard.1c4_lyMp.svg',
        // "mastercard": [
        //     'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/mastercard.1c4_lyMp.svg',
        //     'https://cdn.shopify.com/shopifycloud/admin-ui-foundations/payment-icons/0878f.svg',
        // ],
        "amex" :'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/amex.Csr7hRoy.svg',
        "jcb" : 'https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.en/assets/jcb.BgZHqF0u.svg',
        'discover': Discover,
        'diners_club' : 'https://cdn.shopify.com/shopifycloud/admin-ui-foundations/payment-icons/267b2.svg',
    },
};

// export const PaymentProviders : any = {
//     "AsiaBill" : AsiaBill,
// }
const PaymentIcon  : FC<any> = (props) => {
    const {icon,className= ''} = props;
    return <div className={`rounded flex flex-col justify-center items-center overflow-hidden min-w-[38px] ${className}`}>
        {_isString(icon) ? <img loading={'lazy'} width={38} height={24} className="object-cover overflow-hidden" src={icon}/> : icon }
    </div>
}
const IconList : FC<any> = (props) => {
    const {icons = []} = props;
    const all_icon = (icons||[]).flat(1);
    const {width} = useScreen({
        initializeWithValue:true,
    });
    const less_icon = width < 430 && all_icon.length > 3;
    if(less_icon){
        const clone = [...all_icon];
        const show = clone.splice(0,3);
        return <div className={'flex flex-row space-x-1'}>
            {show.map((icon : any,si : number) => {
                if(_isArray(icon)){
                    return <PaymentIcon icon={icon?.[0]} key={`show_${si}`}/>
                }else{
                    return <PaymentIcon icon={icon} key={`show_${si}`}/>;
                }
            })}
            <Tooltip icon={<div className={'bg-white border shadow px-1'}>+{all_icon.length - 3}</div>}>
                <div className={'flex flex-row flex-wrap gap-2 '}>
                    {clone.map((c: any, hi: number) => {
                        return <PaymentIcon icon={c} key={`hidden_${hi}`}/>;
                    })}
                </div>
            </Tooltip>
        </div>
    }else{
        return  (all_icon).map((icon : any, i : number) => {
            return <PaymentIcon icon={icon} key={`${i}`}/>
        })
    }
}
export const Payment: FC<PaymentProps> = (props) => {
    const {method,token,checked,children} = props;
    const title = {
        "paypal" : "Paypal",
        "credit-card" :<div>
            Credit <span className={'hidden sm:inline'}>/ Debit</span> Card
        </div>,
    }[method.type];
    const logo = null;//Logos[method.type] || null;
    let icons = ((method.icons||[]).map(i=>{
        return Icons[method.type][i];
    }));
    if(icons.length === 0){
        const target = Icons[method.type];
        icons = (_isArray(target) ? target : Object.values(target));
    }
    import.meta.env.DEV && console.log('payment icons:',method.channel,icons);
    return  <div className={'flex flex-col flex-1 items-stretch divide-neutral-300 divide-y cursor-pointer select-none overflow-hidden max-w-full'}>
        <div className={'flex flex-row px-3 space-x-3 py-3'}>
            <div className={'flex flex-col justify-center'}>
                {children}
            </div>
            <div key={method.id} className={'flex flex-1 flex-row justify-between items-center max-w-full overflow-hidden'}>
                    {logo ?
                        <div className={"border-neutral-300 border overflow-hidden rounded px-1"}>
                            <div className={'flex flex-col'}>
                                {logo}
                            </div>
                            {/*<img className="object-cover h-7 w-12" src={method.logo}/>*/}
                        </div> : <div className={'text-sm text-nowrap'}>
                            {title}
                        </div>}
                <div className={'flex flex-row space-x-1 overflow-hidden max-w-full'}>
                    <IconList icons={icons || []}/>
                </div>
            </div>
        </div>
        <div className={cn('p-0 flex flex-col justify-start items-stretch ',{
            'hidden' : !checked,
            'bg-[#F5F5F5]'  : method.type === 'credit-card',
        })}>
            <div className={'flex flex-col'}>
                {
                    (function (m) {
                        const {mode,channel}= m;

                        switch (mode) {
                            case 'component':{
                                switch(channel){
                                    case 'paypal-card':
                                        return <PaypalCard method={m}/>;
                                }
                                break;
                            }
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
                                    src={method.embed ? getReplacePathBase(method.embed): getFinalPath(`/api/checkouts/${token}/gateway/${method.id}/embed`)}
                                    // src={`/a/s/api/gateway/${method.id}/embed`}
                                />
                            }
                            default:
                                return mode;
                        }
                        return null;
                    })(method)
                }
            </div>
            {method.type === 'credit-card' && checked && <BillingAddressStep />}
        </div>
    </div>;
};
