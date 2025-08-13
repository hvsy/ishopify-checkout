import {range as _range} from "lodash-es";
export const Prefix = `__${import.meta.env}_APP_`;

export class AppStorage{
    private _name: string;
    constructor(name : string){
        this._name = `${Prefix}${name}__`;
    }
    get(){
        return localStorage.getItem(this._name);
    }
    remove(){
        localStorage.removeItem(this._name);
        return this;
    }
    set(token : string){
        localStorage.setItem(this._name,token);
        return this;
    }
    static Clear(){
        _range(0,localStorage.length).map((i) => {
            return localStorage.key(i);
        }).filter((key) => {
            return (key && key.startsWith(Prefix));
        }).forEach((key) => {
            localStorage.removeItem(key!);
        })
    }
}
