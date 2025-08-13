import {FC, use} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import {mutate} from "swr";
import {NavConfig} from "../../contants.ts";
import {get as _get,startsWith as _startsWith}  from "lodash-es";
import {useCheckout} from "../../../container/CheckoutContext.ts";
import {FormContext, useCurrentForm} from "../../../container/FormContext.ts";
import {usePaymentMethod} from "../../../container/PaymentContext.tsx";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {Preloader} from "@lib/Cache.ts";
import {SummaryContext} from "../../../container/SummaryContext.tsx";
import {PaymentError} from "../../../exceptions/PaymentError.ts";
import {CurrencyContext} from "../../../container/CurrencyContext.ts";
import {update} from "@lib/payment.ts";
import {MobileCheckoutBoard} from "../../../plugins/DesktopCheckoutBoard.tsx";

export type FooterNavProps = {
};

export const FooterNav: FC<FooterNavProps> = (props) => {
    const form = useCurrentForm();
    const {action = 'information', token} = useParams();
    const navigate = useNavigate();
    const method = usePaymentMethod();
    const nav = NavConfig[action];
    const checkout = useCheckout();
    const basename = `/checkouts/${checkout?.token}`;
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
    const summary = use(SummaryContext);
    const currency = CurrencyContext.use();
    return <div className={'flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center'}>
        <Link className={'text-sm space-x-2 flex flex-row mt-8 sm:mt-0 justify-center items-center cursor-pointer'}
              to={back}
              reloadDocument={href?.charAt(0) === '/'}
        >
            <ChevronLeft size={'16px'}/>
            <div>Return to {nav?.back?.label}</div>
        </Link>
        {action === 'payment' && <MobileCheckoutBoard className={'mt-5'}/>}
        {show_button && <AsyncButton className={'py-3'} onClick={async () => {
            try {
                const values = await form.validateFields();
                import.meta.env.DEV && console.log('validate:',values);
                if (nav?.next?.validator) {
                    await nav.next.validator(values);
                }
                let after : any= false;
                try {
                    if (nav?.next?.submit) {
                        after = await nav.next.submit(checkout,values, basename,method,summary,currency);
                    } else {
                        after = await update(basename,values,checkout!);
                    }
                } catch (e : any) {
                    if(e instanceof PaymentError){
                        navigate("?error=PAYMENT_ERROR",{
                            replace : true,
                        })
                        return;
                    }
                    const status = _get(e, 'response.status');
                    if(status === 422){
                        const data = _get(e, 'response.data.errors');
                        ctx?.setErrors(data);
                    }
                    console.error(e);
                    return;
                }
                if(after !== false){
                    await mutate(basename, (before) => {
                        const final = {
                            ...before,
                            ...after,
                        };
                        Preloader.replace(basename,{
                            ...before,
                            ...after,
                        });
                        return final;
                    },{
                        revalidate : false,
                        populateCache : true,
                    });
                    const href = nav?.next?.href;
                    if(href) {
                        const target  = _startsWith("/",href) ? href : `/a/s/checkouts/${token}/${href}`;
                        navigate(target, {
                            replace: true,
                        });
                    }
                }

            } catch (e) {
                import.meta.env.DEV && console.log('exception:',e);
                console.error(e);
            }
        }}>
            {nav?.next?.label || ''}
        </AsyncButton>}
    </div>
};
