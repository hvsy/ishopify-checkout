import {FC} from "react";
import cy from "currency.js";
import {CurrencyContext} from "../../container/CurrencyContext.ts";
import {useShop} from "../../container/ShopContext.ts";
import {isUndefined as _isUndefined} from "lodash-es";


export type PriceProps = {
    price ?: string|number|null;
    format ?: Partial<DB.Currency['format']>,
    negativeZero ?: boolean;
};
export const Price: FC<PriceProps> = (props) => {
    let {price,negativeZero = false,format} = props;
    const shop = useShop();
    const shop_currency = shop!.currency!;
    const cry = CurrencyContext.use() || shop_currency;
    if(!shop_currency) return 0;
    if(!price){
        if(_isUndefined(price)) return null;
        price = 0;
    }
    return cy(parseFloat(price + '') * parseFloat(cry.rate || '1') / parseFloat(shop_currency.rate || '1') ,{
        ...cry,
        format(currency,settings){
            const pattern = format?.pattern || settings?.pattern || cry.format.pattern;
            const negativePattern = format?.negativePattern || settings?.negativePattern || cry.format.negativePattern;
            const separator = format?.separator || settings?.separator || cry.format.separator;
            const decimal = format?.decimal || settings?.decimal || cry.format.decimal;
            const symbol = settings?.symbol || cry.symbol;

            //@ts-ignore
            const groups = settings.groups;
            let split = ('' + currency).replace(/^-/, '').split('.');
            let dollars = split[0];
            let cents = split[1];
            const value = currency?.value || 0;
            let p = value > 0 ? pattern : negativePattern
            if(value === 0){
                if(negativeZero){
                    p = negativePattern;
                }else{
                    p = pattern;
                }
            }
            return (p)
            .replace('!', symbol)
            .replace('@',cry.code || '')
            .replace('#', dollars.replace(groups, '$1' + separator) + (cents ? decimal + cents : ''));
        }
    }).format();

};
