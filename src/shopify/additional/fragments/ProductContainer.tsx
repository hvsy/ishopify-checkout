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

    return <Product product={product} shop={shop}/>
};
