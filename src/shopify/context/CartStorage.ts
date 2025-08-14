import Cookies from "js-cookie";
import {createContext} from "react";

export class CartStorage{
    private _token: string;
    constructor(token : string) {
        this._token = token;
        const cart = Cookies.get('cart') || '';
        if(cart?.indexOf(token) === 0){
            const segments=  decodeURIComponent(cart).split('?key=');
            this.key = segments[1];
        }
    }
    get token(){
        return this._token;
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

    get key(){
        return localStorage.getItem(this.getStorageKey());
    }

    getStorageKey(){
        return `cart:${this._token}`;
    }
}



