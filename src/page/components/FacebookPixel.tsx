import {FC, useEffect,} from "react";
import {useLocation} from "react-router-dom";
import {usePlainScript} from "@hooks/usePlainScript.tsx";
import {md5} from "js-md5";


export const FacebookPixel: FC<{ pixels: string[] }> = (props) => {
    const {pixels} = props;
    const location = useLocation();
    const pathname = location.pathname;
    usePlainScript('fb-pixel', `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');`);
    useEffect(() => {
        // window.fbq
        pixels.forEach((pixel) => {
            window.fbq?.('init', pixel);
        })

        window.fbq?.("track", "PageView")
    }, [pathname, pixels.join('/')]);
    useEffect(() => {
        window.listen?.((type, event) => {
            const {eventId,...others} = event.data || {};
            const extra : any = {

            }
            if(eventId){
                extra.event_id = md5(eventId);
            }
            switch (type) {
                case "checkout_started": {
                    const data = others as Analytics.StartCheckout;
                    window.fbq?.("track", "InitiateCheckout", {
                        content_ids: data.content_ids,
                        num_item: data.quantity,
                        content_type: 'product_group',
                        value: data.price,
                        currency: data.currency,
                    },extra);
                }
                    break;
                case 'purchase': {
                    const data = others as Analytics.Purchase;
                    window.fbq?.("track", "Purchase", {
                        contents: data.contents,
                        content_type: 'product_group',
                        value: data.price,
                        currency: data.currency,
                        order_id  : md5(data.token),
                    },extra);
                }
                    break;
                case 'add_payment_info':{
                    const data = others as Analytics.AddPaymentInfo;
                    window.fbq?.('track','AddPaymentInfo',{
                        ...data,
                    },extra);
                }
                break;
                default: {
                    console.log('pixel:', type, event);
                }
                    break;
            }
        });
    }, [pixels.join('/')]);
    return null;
};
