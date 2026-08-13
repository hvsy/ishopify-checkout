import {range as _range} from "lodash-es";
// import.meta.env 整体会被模板字符串转成 "[object Object]"，
// 这里应使用具体的 MODE（development/production），避免不同环境共用同一命名空间。
const EnvMode = import.meta.env.MODE || 'app';
export const Prefix = `__${EnvMode}_APP_`;

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
