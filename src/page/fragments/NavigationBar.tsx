import {FC} from "react";
import {Link, } from "react-router-dom";
import {CheckoutContainer, useBasename} from "../../container/CheckoutContext.ts";
import {Price} from "@components/fragments/Price.tsx";
import {get as _get} from "lodash-es";
import {useCurrentStep} from "@hooks/useCurrentStep.ts";
import {getBasename} from "@lib/checkout.ts";

export type SummaryProps = {};

function format(fields : string[],address ?:DB.Address,glue : string = ', '){
    return (fields.map((field) => {
        return _get(address||{},field,null)
    })).filter(t=>!!t).join(glue)
}
export const NavigationBar: FC<SummaryProps> = (props) => {
    const checkout = CheckoutContainer.use();
    const action= useCurrentStep();
    if (action === 'information') return null;
    const shipping_address = checkout?.shipping_address;
    const shipping = [ format(['line1', 'line2','city'],shipping_address,' '),
                       format(['zip','state.en_name',],shipping_address,' '),
                       format(['region.en_name'],shipping_address,', ')]
    .join(', ');
    // const basename ='/a/s' + useBasename();
    const basename = getBasename();
    return <div
        className={'rounded-md border border-neutral-300 overflow-hidden px-4 divide-y divide-neutral-300 text-sm'}>
        {[{
            label: 'Contact',
            value: checkout?.email,
            href: `${basename}`
        }, {
            label: "Ship to",
            value: shipping,
            href: `${basename}`,
        }, {
            label: "Method",
            href: `${basename}/shipping`,
            value: action === 'payment' && checkout?.shipping_line ? <div className={'flex flex-row space-x-2'}>
                        <span>
                            {checkout.shipping_line.name}
                        </span>
                        <span>·</span>
                        <span>
                        <Price price={checkout.shipping_line.price}/>
                    </span>
            </div> : null
        }].filter((item) => {
            return !!item.value;
        }).map((item) => {
            return <div key={item.label}
                        className={'flex flex-row items-start sm:items-center space-x-2 justify-between py-4'}>
                <div className={'flex flex-col sm:flex-row flex-1'}>
                    <div className={'text-neutral-500 w-20'}>{item.label}</div>
                    <div className={'sm:flex-1 pt-1 sm:pt-0 sm:pl-3'}>{item.value}</div>
                </div>
                <div className={'text-sm'}>
                    <Link to={`${item.href}`} className={'text-blue-900'}>
                        Change
                    </Link>
                </div>
            </div>
        })}
    </div>;
};
