export class ValidatorException  extends Error{
    private readonly _errors: any[];
    constructor(message : string,errors : any[]) {
        super(message)
        this._errors = errors;
    }
    getErrors(){
        return this._errors;
    }
}
