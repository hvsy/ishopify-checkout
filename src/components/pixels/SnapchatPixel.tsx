import {FC,} from "react";
import {usePlatformPixel} from "./usePlatformPixel.tsx";
import {sha256} from "js-sha256";
import {getShopifyY, getStorage} from "@lib/shopify.ts";


export const SnapchatPixel: FC<{ pixels: string[] }> = (props) => {
    const {pixels} = props;
    usePlatformPixel('snapchat', {
        script: `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js')`,
        pixels,
        setup: ps => {
            const extra: any = {};
            const shopify_y = getShopifyY();
            if (!!(shopify_y)) {
                extra.external_id = sha256(shopify_y);
            }
            ps.forEach((pixel) => {
                window.snaptr && window.snaptr('init',pixel,extra);
            })
            window.snaptr?.("track", "PAGE_VIEW")
        },
        onEventCallback(type, data, extra) {
            switch (type) {
                case "checkout_started": {
                    const json = data as Analytics.StartCheckout;
                    const extra = getStorage({
                        "uuid_c1": '_scid',
                    })
                    window.snaptr && window.snaptr('track', 'START_CHECKOUT', {
                        ...extra,
                        'currency': data.currency,
                        'price': data.price,
                        client_dedup_id: extra.event_id,
                        'items_ids': json.content_ids,
                        'number_items': json.contents.map((t: any) => t.quantity),
                        'payment_info_available': 0,
                    })
                }
                    break;
                case 'purchase': {
                    const json = data as Analytics.Purchase;
                    const extra = getStorage({
                        "uuid_c1": '_scid',
                    });
                    const payload: any = {
                        ...extra,
                        'currency': data.currency,
                        'price': data.price,
                        'transaction_id': extra.event_id,
                        'client_dedup_id': extra.event_id,
                        item_ids: json.contents.map((t: any) => t.id),
                        number_items: json.contents.map((t: any) => t.quantity),
                    };
                    if (json.email) {
                        payload.user_hashed_email = sha256(json.email);
                    }
                    if (json.address?.phone) {
                        payload.user_hashed_phone = sha256(json.address?.phone);
                    }
                    window.snaptr && window.snaptr('track', 'PURCHASE', payload);
                }
                    break;
                default: {
                    console.log('pixel:', type, data, extra);
                }
                    break;
            }
        }
    })
    return null;
};
