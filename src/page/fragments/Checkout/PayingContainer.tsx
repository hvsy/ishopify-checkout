import {FC, ReactNode, useEffect, useState} from "react";
import {useEventListener} from "usehooks-ts";
import {Loading} from "@components/fragments/Loading.tsx";

export type PayingContainerProps = {
    children ?: ReactNode;
};

export const PayingContainer: FC<PayingContainerProps> = (props) => {
    const {children} = props;
    const [paying,setPaying] = useState(false);
    useEventListener('message', (e) => {
        const data  = e.data || {};
        const {type,event} = data;
        switch(event){
            case 'paying':
            {
                setPaying(true);
                return;
            }
            case 'pay_end':{
                setPaying(false);
                return;
            }
        }
    });
    useEffect(() => {
        if(paying){
             document.body.style.overflow = 'hidden';
        }
        return () => {
           if(paying) {
               document.body.style.removeProperty('overflow');
           }
        }
    },[paying]);
    return <div className={'relative'}>
        {children}
        {paying && <div className={'fixed inset-0 z-50'}>
            <div className={' absolute inset-0 bg-white/80 backdrop-blur z-50'}></div>
            <div className={'absolute inset-0  flex flex-col justify-center items-center z-50'}>
                <div className={'flex flex-col space-y-2 items-center'}>
                    <Loading/>
                    <div>payment is being processed</div>
                </div>
            </div>
        </div>}
    </div>;
};
