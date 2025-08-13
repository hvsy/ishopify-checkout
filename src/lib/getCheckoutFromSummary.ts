import {get as _get, sum} from "lodash-es";
import {transform_address} from "./checkout.ts";

export function getCheckoutFromSummary(summary : any,path : string = 'data.cart'){
    const discounts = _get(summary,`${path}.discountAllocations`,[])
    .filter((discount : any) => {
        return discount.targetType === 'SHIPPING_LINE'
    });
    const selected  = _get(summary,`${path}.deliveryGroups.edges[0].node.selectedDeliveryOption`,{}) as any;
    const formatted = _get(summary,`${path}.delivery.addresses.0.address.formatted`,[]);
    const code = _get(summary,`${path}.delivery.addresses.0.address.countryCode`,[]);
    return {
        email : _get(summary,`${path}.buyerIdentity.email`),
        ship_to : formatted.join(', '),
        shipping_line_id : selected.handle,
        shipping_line : selected,
        countryCode : code,
        ...transform_address(summary,path),
        shipping_discount : discounts?.[0] || null,
    }
}
