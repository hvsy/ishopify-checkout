const code =  'PAYPAL_CARD_APPROVE_EXCEPTION';
export class PaypalCardApproveException extends Error{
    readonly code = code;
    error : string|true;
    constructor(error: string|true) {
        super(typeof error === 'string' ? error : undefined);
        this.error = error;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    static instanceOf(error : any){
        if(!(error instanceof Error)) return false;
        if(error instanceof PaypalCardApproveException) return true;
        if((error as any)?.code === code) return true;
        return false;
    }
}
