import {api} from "@lib/api.ts";
import {payment} from "@lib/payment.ts";
import {omit as _omit} from "lodash-es";
import {CheckoutSummary} from "../container/SummaryContext.tsx";

export const Steps = ['information','shipping','payment'] as const;

export type StepTypes = typeof Steps[number];
export const PaymentMethodTypes = ["redirect","builtin","popup","embed-in"] as const;

export type PaymentMethodType = typeof PaymentMethodTypes[number];

export const NavConfig: any = {
    information: {
        action: 'information',
        back: {
            label: 'cart',
            href: '/cart',
        },
        next: {
            label: 'Continue to ship',
            href: 'shipping',
        }
    },
    shipping: {
        action: 'shipping',
        back: {
            label: 'information',
            href: 'information',
        },

        next: {
            label: 'Continue to payment',
            href: 'payment',
            async submit(checkout :DB.Checkout,values :any,url : string){
                return await api({
                    method : 'put',
                    url : `${url}/shipping`,
                    data:_omit(values,['shipping_line','shipping_address','billing_address']),
                });
            },
        }
    },
    payment: {
        action: 'payment',
        back: {
            label: "shipping",
            href: 'shipping',
        },
        next: {
            label: "Complete order",
            async submit(checkout :DB.Checkout,values: any,url: string,method : DB.PaymentMethod,summary : CheckoutSummary,currency  : DB.Currency) {
                return await payment(checkout,values,url,method,summary,currency);
            },
            async validator(values: any) {
                if (!values.shipping_line_id) {
                    throw "must select shipping method";
                }
            }
        }
    }

}
