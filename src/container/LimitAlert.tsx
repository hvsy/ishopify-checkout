import {FC, ReactNode, useEffect} from "react";

export type LimitAlertProps = {
    limit: string;
    children?: ReactNode;
};

export const LimitAlert: FC<LimitAlertProps> = (props) => {
    const {limit, children} = props;
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return ()=>{
            document.body.style.removeProperty('overflow');
        }
    }, []);
    return <div
        className={'absolute inset-0 w-full h-[100vh] bg-[rgba(0,0,0,0.5)] flex flex-col justify-center items-center z-[1000]'}>
        <div className={'flex flex-col justify-center space-y-5 items-center bg-white py-10 md:px-20 shadow-md md:mx-0 mx-10 px-5 text-center'}>
            <span>
                The amount of the order cannot exceed {limit}, please return to reduce the amount of the purchase item.
            </span>
            <a className={'cursor-pointer flex flex-col py-2 px-10 bg-black text-white'} href={'/cart'}>Ok</a>
        </div>
    </div>
};
