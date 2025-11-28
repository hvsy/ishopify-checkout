import {z} from "zod";
import {ValidatePhone} from "../shopify/lib/helper.ts";

export let MethodValidators: any = {
    shipping: {
        prev: 'information',
        validator(checkout: DB.Checkout) {
            const address = z.object({
                first_name: z.string().nullish().nullable(),
                last_name: z.string(),
                line1: z.string(),
                line2: z.string().nullish().nullable(),
                zip: z.string(),
                phone: z.string().refine(ValidatePhone),
                region_code: z.string(),
                state_code: z.string().nullable().optional(),
                // region_id: z.number(),
                // state_id: z.number().nullable().optional(),
            });
            const validator = z.object({
                email: z.string().email(),
                shipping_address: address,
                billing_address: address.nullable().optional(),
            })
            try {
                validator.parse(checkout);
                return true;
            } catch (e) {
                console.log('information validator:', e);
                return false;
            }
        }
    },
    payment: {
        prev: 'shipping',
        validator(checkout: DB.Checkout) {
            return !!checkout.shipping_line_id
        }
    },
};
