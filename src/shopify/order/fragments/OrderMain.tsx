import {FC} from "react";
import {CheckCircleIcon, CreditCardIcon, HelpCircle} from "lucide-react";
import {isString as _isString, startCase as _startCase} from "lodash-es";
import Big from "big.js";
import {formatAddress} from "../../../page/order";
import {useLoaderData, useParams} from "react-router-dom";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";
import {get as _get} from "lodash-es";

export type OrderMainProps = {};

export const OrderMain: FC<OrderMainProps> = (props) => {
    const {} = props;
    const data = useLoaderData() as Shopify.Order;
    const {action} = useParams();
    const format = useMoneyFormat();
    const name = [_get(data,'shipping_address.first_name'),_get(data,'shipping_address.last_name')].filter((name) => {
        return !!name;
    }).join(' ');
    return <div className={'flex flex-col flex-1 items-stretch space-y-6 sm:max-w-[638px]'}>
        <a className={'text-center font-bold text-3xl'} href={'/'}>
            {data.shop.title || data.shop.name}
        </a>
        <div className={'flex flex-col space-y-2'}>
            <div className={'flex flex-row items-center space-x-2 font-bold md:font-normal'}>
                <div>
                    <CheckCircleIcon className={'text-green-400 size-5'}/>
                </div>
                <div>Thank you {name}</div>
            </div>
            <div className={'flex flex-row space-x-3 text-sm'}>
                <div>Order:</div>
                <div>{data.number}</div>
            </div>
        </div>
        <div className={'rounded border border-gray-300 p-4 space-y-2'}>
            <div>
                Your order has been confirmed
            </div>
            <div className={'text-sm'}>
                We have received your order and are preparing it. Return to this page to keep track of order
                status updates in time.
            </div>
            <div className={'flex flex-row justify-between text-sm'}>
                <div>
                    Pay with {_startCase(data.gateway_type)}
                </div>
                <a className={'block'} href={`mailto:${data.shop.config?.email?.contact}`}>
                    Contact us
                </a>
            </div>
        </div>
        <div className={'rounded border border-gray-300 p-4'}>
            <div className={'grid grid-cols-1 md:grid-cols-2 gap-y-5'}>
                <div>
                    Customer information
                </div>
                <div>

                </div>
                {[{
                    label: "Contact information",
                    render() {
                        return <div>
                            {data.email}
                        </div>
                    }
                }, {
                    label: "Payment method",
                    render() {
                        const total = data.total_amount.amount;
                        if (Big(total).cmp(0) === 0) {
                            return "Free";
                        }
                        const icons: any = {
                            'paypal': 'https://cdn.shopify.com/shopifycloud/admin-ui-foundations/payment-icons/26628.svg',
                            'credit-card': <CreditCardIcon/>,
                        };
                        const icon = icons[data.gateway_type] || '';
                        return <div className={'flex flex-row space-x-2 items-center'}>
                            <div>
                                {_isString(icon) ? <img src={icon}/> : icon}
                            </div>
                            <div className={'flex flex-row space-x-1'}>
                                <div>
                                    {_startCase(data.gateway_type)}
                                </div>
                                <div>
                                    {format(data.total_amount)}
                                </div>
                            </div>
                        </div>;
                    }
                }, {
                    label: "Shipping address",
                    render() {
                        const address = data.shipping_address;
                        return <div>
                            <div>
                                {formatAddress(address as DB.Address)}
                            </div>
                            <div>{address.phone}</div>
                        </div>
                    }
                }, {
                    label: "Billing address",
                    render() {
                        const address = data.billing_address || data.shipping_address;
                        return <div>
                            <div>
                                {formatAddress(address as DB.Address)}
                            </div>
                            <div>
                                {address.phone}
                            </div>
                        </div>
                    }
                }, {
                    label: 'Shipping method',
                    render() {
                        return data.shipping_line?.title;
                    }
                }
                // }, {
                //     label: "Shipping insurance",
                //     render() {
                //         if (data.insurance === null || data.insurance === undefined) {
                //             return '-';
                //         }
                //         return <span>!!!!!! insurance</span>
                //         // return format(data.in);
                //         // return <Price price={data.insurance}/>;
                //     }
                // }
                ].map((item, key) => {
                    return <div key={key}>
                        <div>
                            {item.label}
                        </div>
                        <div className={'text-sm'}>
                            {item.render()}
                        </div>
                    </div>
                })}
            </div>
        </div>
        <div
            className={'flex flex-col space-y-5 md:space-y-0 justify-start md:flex-row items-center md:justify-between'}>
            <div className={'flex flex-row space-x-2 text-sm items-center'}>
                <div>
                    <HelpCircle/>
                </div>
                <a className={'flex flex-row space-x-2'} href={`mailto:${data.shop.config?.email?.contact}`}>
                    <div>
                        Need help?
                    </div>
                    <div>
                        Contact us
                    </div>
                </a>
            </div>
            <a className={'text-center block p-4 bg-black text-white cursor-pointer'} href={'/'}>
                Continue shopping
            </a>
        </div>
        <div className={'border-b border-gray-300'}></div>
        <div className={'text-xs'}>
            All rights reserved {data.shop.title || data.shop.name}
        </div>
    </div>;
};
