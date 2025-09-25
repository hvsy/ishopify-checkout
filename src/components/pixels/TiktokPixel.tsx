import {FC,} from "react";
import {md5} from "js-md5";
import {isArray} from "lodash-es";
import {usePlatformPixel} from "./usePlatformPixel.tsx";
import StartCheckout = Analytics.StartCheckout;
import Purchase = Analytics.Purchase;
import AddPaymentInfo = Analytics.AddPaymentInfo;


export const TiktokPixel: FC<{ pixels: string[] }> = (props) => {
    const {pixels} = props;
    usePlatformPixel('tiktok',{
        script : `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
}(window, document, 'ttq');`,
        setup : ps=> {
            ps.forEach((p) => {
                window.ttq?.load(p);
            })
            window.ttq.page();
        },
        pixels,
        onEventCallback(type,data,extra){
            switch (type) {
                case "checkout_started": {
                    const json = data as StartCheckout;
                    window.ttq?.track?.("InitiateCheckout", {
                        content_ids: json.content_ids,
                        contents : json.contents.map((line) => {
                            return {
                                'content_id' : line.id,
                                'quantity' : line.quantity,
                                'price' : line.price,
                                'currency':line.currency,
                            }
                        }),
                        quantity: json.quantity,
                        // content_type: 'product_group',
                        value: data.price,
                        currency: data.currency,
                    },extra);
                }
                    break;
                case 'purchase': {
                    const json = data as Purchase;
                    window.ttq?.track?.('Purchase',{
                        content_ids : json.contents.map((t) => {
                            return t.id;
                        }),
                        contents : json.contents.map((line) => {
                            return {
                                'content_id' : line.id,
                                'quantity' : line.quantity,
                                'price' : line.price,
                                'currency': line.currency,
                            };
                        }),
                        quantity : json.quantity,
                        value : json.price,
                        currency : json.currency,
                        order_id : md5(json.token),
                    },extra)
                }
                    break;
                case 'add_payment_info':{
                    const json = data as AddPaymentInfo;
                    const lines = isArray(json.cart) ? json.cart : [json.cart];
                    window.ttq?.track('AddPaymentInfo',{
                        contents : (lines).map((line : any) => {
                            return {
                                'content_id' : line.id,
                                "quantity" : line.quantity,
                                'price' : line.price.amount,
                                'currency' : line.price.currencyCode,
                            }
                        }),
                        value : data.price,
                        currency : data.currency,
                    },extra);
                }
                    break;
                default: {
                    console.log('pixel:', type, data,extra);
                }
                break;
            }
        }
    })
    return null;
};
