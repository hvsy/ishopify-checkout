import {get as _get, sum} from "lodash-es";
import {transform_address} from "./checkout.ts";
import {getJsonFromMeta} from "./metaHelper.ts";

const shipping = getJsonFromMeta('preset_shipping') || {};
export function getCheckoutFromSummary(summary : any,path : string = 'data.cart'){
    const discounts = _get(summary,`${path}.discountAllocations`,[])
    .filter((discount : any) => {
        return discount.targetType === 'SHIPPING_LINE'
    });
    const groupId = _get(summary,`${path}.deliveryGroups.edges[0].node.id`,null) as any;
    const selected  = _get(summary,`${path}.deliveryGroups.edges[0].node.selectedDeliveryOption`,{}) as any;
    const formatted = _get(summary,`${path}.delivery.addresses.0.address.formatted`,[]);
    const code = _get(summary,`${path}.delivery.addresses.0.address.countryCode`,null);
    const  countryCode = _get(summary,`${path}.buyerIdentity.countryCode`,null);
    return {
        email : _get(summary,`${path}.buyerIdentity.email`) || shipping?.email || '',
        ship_to : formatted.join(', '),
        shipping_line_id : selected?.handle,
        shipping_group_id : groupId,
        shipping_line : selected,
        countryCode : code || countryCode,
        ...transform_address(summary,path,shipping),
        shipping_discount : discounts?.[0] || null,
        billing_address : null,
    }
}
