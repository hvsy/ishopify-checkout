import {FC} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import {MobileCheckoutBoard} from "../../plugins/DesktopCheckoutBoard.tsx";
import {AsyncButton} from "../fragments/AsyncButton.tsx";
import {update} from "@lib/payment.ts";
import {PaymentError} from "../../exceptions/PaymentError.ts";
import {get as _get, startsWith as _startsWith} from "lodash-es";
import {mutate} from "swr";
import {Preloader} from "@lib/Cache.ts";
import {FormContext, useCurrentForm} from "../../container/FormContext.ts";
import {usePaymentMethod} from "../../container/PaymentContext.tsx";
import {NavConfig} from "../../page/contants.ts";
import {getBasename} from "@lib/checkout.ts";
import {ValidatorException} from "../../exceptions/ValidatorException.ts";
import {useDeliveryGroups} from "../../shopify/context/DeliveryGroupContext.tsx";
import {cn} from "@lib/cn.ts";

export type Actions = 'information'|'shipping'|'payment';
export type NextActions = { [index in Actions] : StandardNextAction};

export type StandardNextAction = {
    submit ?: (values : any,action : Actions,method ?: DB.PaymentMethod|null)=>Promise<any>;
    validator ?: (values : any)=>Promise<void>;
};


export type StandardFooterNavFrameProps = {
    actions : NextActions;
};

export const StandardFooterNavFrame: FC<StandardFooterNavFrameProps> = (props) => {
    const {actions} = props;
    const form = useCurrentForm();
    const params = useParams();
    const {token} = params;
    const action = (params.action || 'information') as Actions;
    const navigate = useNavigate();
    const method = usePaymentMethod();
    const nav = NavConfig[action];
    // const basename = `/checkouts/${checkout?.token}`;
    const basename = getBasename();
    let back = '/';

    const ctx = FormContext.use();
    const href= nav?.back.href;
    if(href){
        if((href as string).charAt(0) === '/'){
            back = href;
        }else{
            back = `${basename}/${href}`;
        }
    }
    const show_button = !method?.standalone?.payment;
    const {loading,changing} = useDeliveryGroups();
    return <div className={'flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center'}>
        <Link className={'text-sm space-x-2 flex flex-row mt-8 sm:mt-0 justify-center items-center cursor-pointer'}
              to={back}
              reloadDocument={href?.charAt(0) === '/'}
        >
            <ChevronLeft size={'16px'}/>
            <div>Return to {nav?.back?.label}</div>
        </Link>
        {action === 'payment' && <MobileCheckoutBoard className={'mt-5'}/>}
        {show_button && <AsyncButton className={cn({
            "animate-pulse" : loading || changing,
        },`py-3`)} onClick={async () => {
            try {
                const values = await form.validateFields();
                import.meta.env.DEV && console.log('validate:',values);
                const next = actions[action];
                if (next?.validator) {
                    await next.validator(values);
                }
                try {
                    if (next?.submit) {
                        await next.submit(values,action,method);
                    }
                } catch (e : any) {
                    if(e instanceof PaymentError){
                        navigate("?error=PAYMENT_ERROR",{
                            replace : true,
                        })
                    }else if(e instanceof ValidatorException){
                        ctx?.setErrors(e.getErrors());
                    }else{
                        console.log(e);
                    }
                    return;
                }
                const href = nav?.next?.href;
                if(href) {
                    const target  = _startsWith("/",href) ? href : `/a/s/checkouts/${token}/${href}`;
                    navigate(target, {
                        replace: true,
                    });
                }
            } catch (e) {
                import.meta.env.DEV && console.log('exception:',e);
                console.error(e);
            }
        }}>
            {nav?.next?.label || ''}
        </AsyncButton>}
    </div>;
};
