import {FC,} from "react";
import {md5} from "js-md5";
import {usePlatformPixel} from "./usePlatformPixel.tsx";
import Cookies from "js-cookie";
import {sha256} from "js-sha256";


export const FacebookPixel: FC<{ pixels: string[] }> = (props) => {
    const {pixels} = props;
    usePlatformPixel('facebook',{
        script : `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');`,
        pixels,
        setup : ps =>{
            const extra : any = {

            };
            const shopify_y = Cookies.get('_shopify_y');
            if(!!(shopify_y)){
                extra.external_id = sha256(shopify_y);
            }
            ps.forEach((pixel) => {
                window.fbq?.('init', pixel,extra);
            })
            window.fbq?.("track", "PageView")
        },
        onEventCallback(type,data,extra){
            switch (type) {
                case "checkout_started": {
                    const json = data as Analytics.StartCheckout;
                    window.fbq?.("track", "InitiateCheckout", {
                        content_ids: json.content_ids,
                        num_item: json .quantity,
                        content_type: 'product_group',
                        value: data.price,
                        currency: data.currency,
                    },extra);
                }
                    break;
                case 'purchase': {
                    const json = data  as Analytics.Purchase;
                    window.fbq?.("track", "Purchase", {
                        contents: json.contents,
                        content_type: 'product_group',
                        value: data.price,
                        currency: data.currency,
                        order_id  : md5(json.token),
                    },extra);
                }
                    break;
                case 'add_payment_info':{
                    const json = data as Analytics.AddPaymentInfo;
                    window.fbq?.('track','AddPaymentInfo',{
                        value : json.price,
                        currency : json.currency,
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
