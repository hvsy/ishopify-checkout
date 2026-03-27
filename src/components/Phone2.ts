import {ValidatePhone} from "../shopify/lib/helper.ts";

export class Phone2{
    _number ?: string | null;
    _dialCode ?: string | null;
    _intputValue ?: string|null;

    set number(n : string|null|undefined){
        this._number = n;
    }
    set dialCode(code : string|null|undefined){
        this._dialCode = code;
    }
    set input(value : string|null|undefined){
        this._intputValue = value;
    }

    get inputValue(){
        return this._intputValue;
    }
    get number(){
        return this._number;
    }
    get dialCode(){
        return this._dialCode;
    }

    replace(search : string,replacer : string){
        return this.toString().replace(search,replacer);
    }
    getFullPhone(){
        const firstVersion = this.toString();
        if(!ValidatePhone(firstVersion)){
            const secondVersion = this.validate();
            if(secondVersion !== false){
                return secondVersion;
            }
        }
        return firstVersion;
    }
    toString(){
        return [
            this._dialCode?.trim() ? `+${this._dialCode?.trim()}` : null
            ,this._number?.trim()
        ].filter(Boolean).join('').trim();

    }
    validate(){
       const dc = (this.dialCode||'').replace('+','');
        import.meta.env.DEV && console.log('phone2 dial code:',dc,this);
        if(dc && this.number){
            const vn = this.number;
            if(vn?.startsWith(dc)){
                const final  = `+${dc}${vn.replace(new RegExp(`^${dc}`),'')}`;
                if(ValidatePhone(final)) {
                    return final;
                }
            }
        }
        return false;
    }
}

