import {map2} from "../shopify/context/ShopifyCheckoutContext.tsx";
import Validators from "validator";

export function buildAddress(address: any) {
    const after = map2(address, {
        id: 'id',
        city: 'city',
        firstName: 'first_name',
        lastName: 'last_name',
        address1: 'line1',
        address2: 'line2',
        phone: 'phone',
        countryCode: 'region_code',
        provinceCode: 'state_code',
        zip: 'zip',
    }, true)
    if (!Validators.isMobilePhone(after.phone || '', "any", {
        strictMode: true,
    })) {
        after.phone = "";
    }
    return after;
}
