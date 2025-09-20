import {FC} from "react";
import {gql, useQuery} from "@apollo/client";

import ProductQuery from "../../../query/additional/product.gql?raw";
import {Loading} from "@components/fragments/Loading.tsx";
import {Product} from "./Product.tsx";
import {useLoaderData} from "react-router-dom";

export type ProductProps = {
    id : string;
};

export const ProductContainer: FC<ProductProps> = (props) => {
    const {id} = props;
    const {regionCode} =useLoaderData() as any;
    const {data,loading,}=useQuery(gql([
        ProductQuery
    ].join("\n")),{
        variables : {
            id: id,
            regionCode,
        }
    });
    if(loading){
        return <div className={'flex flex-col justify-center items-center flex-1'}>
            <Loading/>
        </div>
    }
    const product = data?.product;
    const shop = data?.shop;

    return <div className={'flex flex-col items-stretch'}>
        <Product product={product} shop={shop}/>
        <div className={'pb-[60px] flex flex-row justify-between text-xs sm:text-sm p-2 sm:pt-5 sm:pb-0 sm:px-0 bg-white'}>
            <div>
                Privacy policy
            </div>
            <div className={'flex flex-row items-center space-x-1'}>
                <p>&copy;</p>
                <p>
                    {(new Date()).getFullYear()},
                </p>
                <span>
                            {shop?.name} Powered by Shopify
                        </span>
            </div>
        </div>
    </div>
};
