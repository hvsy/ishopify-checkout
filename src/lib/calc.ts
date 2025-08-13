
import Big from "big.js";

export function getSubtotal(line_items ?: DB.CartItem[]){
    return ((line_items||[])?.reduce((prev,current) => {
        if(current.free_gift) return prev;
        return prev.add(Big(current.quantity).mul(current.price || current.variant.price))
    },Big(0))) || Big(0);
}
