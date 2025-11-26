import {FC} from "react";
import {usePlatformPixel} from "./usePlatformPixel.tsx";
import {getShopifyY} from "@lib/shopify.ts";
import {sha256} from "js-sha256";

export type NewsbreakPixelProps = {
    pixels: string[]
};

function getExtra(){
    const sy  = getShopifyY();
    if(!sy){
        return {};
    }
    return {
        ext_id : sha256(sy),
    }
}

export const NewsbreakPixel: FC<NewsbreakPixelProps> = (props) => {
    const {pixels} = props;
    usePlatformPixel('newsbreak', {
        script: `!(function (e, n, t, i, p, a, s) {
  e[i] ||
    (((p = e[i] =
      function () {
        p.process ? p.process.apply(p, arguments) : p.queue.push(arguments);
      }).queue = []),
    (p.t = +new Date()),
    ((a = n.createElement(t)).async = 1),
    (a.src = 'https://static.newsbreak.com/business/tracking/nbpixel.js?t=' + 864e5 * Math.ceil(new Date() / 864e5)),
    (s = n.getElementsByTagName(t)[0]).parentNode.insertBefore(a, s));
})(window, document, 'script', 'nbpix');`,
        pixels,
        setup : ps=>{
            ps.forEach((pixel) => {
                window.nbpix && window.nbpix('init', pixel);
            });
            window.nbpix && window.nbpix('event', 'pageload');
        },
        onEventCallback(type,data,extra){
            switch(type){
                case 'checkout_started':{
                    const json = data as Analytics.StartCheckout;
                    window.nbpix && window.nbpix('event','initiate_checkout',{
                        ...getExtra(),
                        nb_value : json.price,
                    });
                    break;
                }
                case 'purchase':{
                    const json = data  as Analytics.Purchase;
                    const payload : any = {
                        ...getExtra(),
                        nb_value : json.price,
                    }
                    if(!!json.email){
                        payload.nb_em = sha256(json.email.trim().toLowerCase());
                    }
                    if(!!json?.address?.phone){
                        payload.nb_ph = sha256(json.address.phone.trim().toLowerCase());
                    }
                    window.nbpix && window.nbpix('event','complete_payment',payload);
                    break;
                }
                case 'add_payment_info':{
                    const json = data as Analytics.AddPaymentInfo;
                    window.nbpix && window.nbpix('event','add_payment_info',{
                        ...getExtra(),
                        nb_value : json.price,
                    });

                }

            }
        }
    })
    return null;
};
