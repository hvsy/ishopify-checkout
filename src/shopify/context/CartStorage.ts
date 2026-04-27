import Cookies from "js-cookie";
import {getFinalPath} from "@lib/api.ts";

export class CartStorage{
    private _token: string;
    private _shop ?: string;
    constructor(token : string,shop ?: string) {
        this._token = token;
        this._shop = shop;
        const cart = Cookies.get('cart') || '';
        if(cart?.indexOf(token) === 0){
            const segments=  decodeURIComponent(cart).split('?key=');
            this.key = segments[1];
        }
    }
    get token(){
        return this._token;
    }
    get beacon(){
        return getFinalPath(`/checkouts/${this.token}/beacon`,this._shop);
    }
    get gid() : string{
        return `gid://shopify/Cart/${this._token}?key=${this.key}`;
    }
    set key(key : string|null){
        if(key){
            localStorage.setItem(this.getStorageKey(),key);
        }else{
            localStorage.removeItem(this.getStorageKey());
        }
    }
    reset(){
        localStorage.removeItem(this.getStorageKey());
    }
    get key(){
        const key = localStorage.getItem(this.getStorageKey());
        if(key !== 'undefined'){
            return key;
        }else{
            localStorage.removeItem(this.getStorageKey());
            return null;
        }
    }

    getStorageKey(){
        return `cart:${this._token}`;
    }
    get basename(){
        return getFinalPath(`/checkouts/${this.token}`,this._shop);
    }
    get api(){
        return getFinalPath(`/api/checkouts/${this.token}`,this._shop);
    }
}



