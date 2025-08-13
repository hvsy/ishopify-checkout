declare module "*.gql"
{
    const content: string;
    export default content;
}

type ReportEvent = keyof Analytics.Events;
namespace Analytics{
    type ViewPage = {

    };
    type StartCheckout = {
        content_ids : string[];
        quantity : number;
        price ?: string;
        currency ?: string;
    };
    type Purchase = {
        price ?: string;
        currency ?: string;
        contents : {
            id : string;
            quantity : number;
        }[];
        token : string;
    };
    type AddPaymentInfo = {
        price ?: string;
        currency ?: string;
    }
    type Event<NAME extends string,T = any> = {
        name : NAME;
        data : T & {
            eventId ?: string;
        },
    }
    type Events = {
        "checkout_started" : Event<"checkout_started",StartCheckout>
        'add_payment_info' : Event<"add_payment_info",AddPaymentInfo>,
        'purchase' : Event<"purchase",Purchase>,
    }
}

interface Window {
    fbq: (fun : string,event : string,data ?: any,extra ?: any)=>void;
    Analytics : import('mitt').Emitter<Analytics.Events>;
    report ?: <Key extends keyof Analytics.Events>(name : Key,
                                                   data : Omit<Analytics.Events[Key]['data'],"eventId">,
                                                   eventId ?: string,
    )=>void;
    listen ?: (callback : (key : ReportEvent,data : {name : typeof key,
        data : Analytics.Events[typeof key]['data']})=>void
    )=>void;
}
namespace DB {

    type OrderLineItem = {
        id : number;
        free_gift ?: boolean;
        allotment ?: any;
        price : string;
        variant : Variant;
        product : Product;
        variant_id : number;
        product_id : number;
        quantity : number;
        sku ?: string;
        name : string;
        discount ?: string;
    };
    type Order = {
        thanked ?: boolean;
        shipping_line : ShippingLine,
        shipping_address : Address,
        billing_address ?: Address,
        line_items : OrderLineItem[]
        note ?: string;
        number:string;
        prefix : string;
        shop : Shop;
        token : string;
        total_price : string;
        total_usd : string;
        currency : Currency;
        insurance : string|null;
        gateway_type: string;
        email : string;
        discount ?: DB.Discount;
        subtotal_amount : Money,
        discounted_amount ?: Moeny,
        total_amount : Money
    }
    type EmbedProvider = {
        channel : string;
        data : any;
    }
    type Attachment = {
        media ?: Media;
    }
    type Variant = {
        title: string;
        price: string;
        options : string[];
        option1: string | null;
        option2: string | null;
        option3: string | null;
        attachment?: Attachment,
    };
    type Product = {
        id : number;
        title : string;
        cover : Attachment;
    }
    type Video = {
        id?: string | number;
        url: string;
        width : number;
        height : number;
        thumbnail ?: string;
    };
    type Image = {
        id?: string | number;
        url: string;
        width : number;
        height : number;
        thumbnail ?: string;
    }
    type Media = (Video | Image);
    type CartItem = {
        id: number;
        product : Product,
        quantity: number;
        variant: Variant,
        free_gift?: boolean;
        price ?: string;
        discount ?: string;
    };
    type Address = {
        first_name: string;
        last_name: string;
        line1: string;
        line2?: string;
        zip: string;
        phone: string;
        city: string;
        region_id: number;
        state_id?: number;
        state ?: Zone;
        region : Zone;
    }
    type Zone = {
        en_name : string;
        cn_name : string;
        code : string;
    }
    type Checkout = {
        line_items: CartItem[];
        token : string;
        cart_token: string;
        shipping_line?: ShippingLine | null;
        shipping_insurance ?: boolean;
        shipping_line_id?: number | null;
        discount?: Discount;
        email?: string | null;
        shipping_address_id ?: null;
        billing_address_id ?: null;
        shipping_address?: Address;
        billing_address?: Address;
        shop : DB.Shop,
        currency : DB.Currency
        plugins ?: {
            system ?: {
                checkout_board ?: {
                    desktop ?: Media;
                    mobile ?: Media;
                },
                countdown ?: {
                    status ?: boolean;
                    time ?: number;
                }
            },
        }
    };

    type Currency = {
        format : {
            decimal : string;
            pattern : string;
            precision : number;
            separator : string;
            negativePattern : string;
        },
        rate: string,
        code: string,
        symbol : string;
    }
    type ShippingLine = {
        id: number;
        name: string;
        price: string;
        max : string;
        min : string;
        type : 'price' | 'weight',
    };

    type PaymentMethod = {
        id: number;
        type : 'paypal'| 'credit-card',
        // title: string;
        logo?: string;
        icons?: string[];
        standalone ?: {
            payment ?: boolean;
        },
        mode: import("./page/contants").PaymentMethodType;
        channel : string;
    };
    type DiscountType = 'percent' | 'cutoff' | 'free_shipping';

    type Discount = {
        code ?: string;
        title ?: string;
        free_shipping ?: true;
        // type: DiscountType;
        // value?: string;
    }
    type FacebookPixel = {
        pixel_id : string;
    };
    type Tracking = {
        facebook ?:  string[];
        tiktok ?: string[];
        pinterest ?: string[];
    };
    type ShopPreference = {
        checkout?: {
            countdown?: number;
            insurance?: {
                rate : number;
                default : boolean;
                enabled : boolean;
            };
            page_style ?: 'single' | 'standard',
            order_amount_limit ?: number;
            order_amount_fixed ?: number;
        },
        tracking ?: Tracking;
    };
    type Shop = {
        name: string;
        title ?: string;
        logo?: {
            width : number;
            height : number;
            url : string;
        };
        payment_limit ?: number;
        preference?: ShopPreference,
        currency : Currency;
        config  ? : {
            email ?: {
                contact ?: string;
            }
        }
    };


}

namespace Shopify{
    type Money = {
        amount : number|string;
        currencyCode : string;
    };
    type Image = {
        src : string;
        width : number;
        height:number;
    }
    type LineItem = {
        variant : {
            url : string;
            id : string;
            image : Image;
            sku ?: string;
        },
        quantity : number;
        title : string;
        product : {
            title : string;
            id : string;
            image : Image;
        };
        unit : Money;
        original_unit : Money,
        subtotal:Money;
        total : Money;
        options : any[];
        discounted : Money & {
            codes ?: string[]
        };
    };
    type Shop = {
        title : string;
        name : string;
        config ?: {
            email ?: {
                contact ?: string;
            }
        }
    }
    type Address = {
        first_name ?: string;
        last_name ?: string;
        phone : string;
        line1 : string;
        line2 ?: string;
        city ?: string;
        state ?: {
            en_name : string;
        }
        region : {
            en_name : string;
        }
        zip : string;
    };
    type Order = {
        cart_id : string;
        email : string;
        number : string;
        subtotal_amount : Money;
        total_saved ?: Money;
        total_amount : Money;
        discounted_amount ?: Money;
        line_items : LineItem[];
        shop : Shop;
        discount_codes : any;
        shipping_cost ?: Money;
        shipping_discounts : any;
        shipping_amount : Money;
        gateway_type : string;
        shipping_address : Address,
        billing_address ?: Address,
        shipping_line : {
            id : string;
            title : string;
            handle : string;
            code : string;
            price : Money;
        }
    }
}
