import {FC, useEffect} from "react";
import {CountDown} from "@components/fragments/CountDown.tsx";
import {useLoaderData, useParams} from "react-router-dom";
import {ProductContainer} from "./fragments/ProductContainer.tsx";
import useSWR from "swr";
import {Loading} from "@components/fragments/Loading.tsx";
import {useCleanCartCookie} from "../hooks/useCleanCartCookie.ts";

export type AdditionalProps = {};

export const Additional: FC<AdditionalProps> = (props) => {
    const {} = props;
    const {token} = useParams();
    const data = useLoaderData() as any;
    // const {data,isLoading,error} = useSWR();
    useCleanCartCookie(data?.cart_gid);
    if(!data){
        return <div className={'flex flex-col justify-center items-center flex-1'}>
            <Loading/>
        </div>
    }
    return <div className={'flex flex-col items-stretch min-h-[100vh] min-w-[100vw] p-0 sm:p-5 divide-y divide-gray-200'}>
        <div className={'flex-1 flex flex-col items-stretch'}>
            <div className={'bg-yellow-400 text-black flex flex-row justify-center items-center sm:text-2xl py-5 font-bold'}>
                Prepare for an Outstanding Shopping Experience
            </div>
            <div className={'flex flex-row items-center justify-center py-5'}>
                Exclusive ONe Time Offer Just for You!
            </div>
            <div className={'flex flex-row items-center justify-center py-5 bg-yellow-400 space-x-3'}>
                <CountDown milliseconds={10 * 1000 * 60} name={`additional-${token}`}
                           prefix={<span className={'text-black'}>
                                    Hurry! Special Offer Expires in
                           </span>}
                           expired={<span className={'accent-orange-500'}>
                               Order reservation ended.
                           </span>}
                           containerClassName={''}
                           format={'mm:ss'}
                           className={'bg-transparent text-red-500 font-bold text-xl'}
                           auto={true}
                />
            </div>
            <ProductContainer id={data.product_id}/>
        </div>
        <div className={'flex flex-row justify-between text-xs sm:text-sm p-2 sm:pt-5 sm:pb-0 sm:px-0'}>
            <div>
                Privacy policy
            </div>
            <div className={'flex flex-row items-center space-x-1'}>
                <p>&copy;</p>
                <p>
                    {(new Date()).getFullYear()},
                </p>
                <span>
                    {"mydraftorder"} Powered by Shopify
                </span>
            </div>
        </div>
    </div>;
};
