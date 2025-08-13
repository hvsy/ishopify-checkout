import {get as _get,set as _set} from 'lodash-es';
import {gql, useQuery } from "@apollo/client";
import {useEffect} from "react";

export function useAllEdges(query : string,variables : any  ={},path : string){
    const { data, loading, fetchMore } = useQuery(gql(query), {
        variables,
        notifyOnNetworkStatusChange: true,
    });
    // console.log('all edges:', loading, data);
    useEffect(() => {
        if (!data?.cart?.lines) return;

        const { pageInfo } = _get(data,path);
        (async () => {
            // 不断执行 fetchMore，直至没有下一页
            while (pageInfo.hasNextPage) {
                const cursor = pageInfo.endCursor;
                const result = await fetchMore({
                    variables: { after: cursor },
                    // 合并数据策略也可通过 cache fieldPolicy 实现
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                            cart: {
                                ...fetchMoreResult.cart,
                                lines: {
                                    ...fetchMoreResult.cart.lines,
                                    edges: [
                                        ...prev.cart.lines.edges,
                                        ...fetchMoreResult.cart.lines.edges,
                                    ],
                                },
                            },
                        };
                    },
                });
                // 更新 pageInfo 用于下一轮判断
                _set(data,path + '.pageInfo',_get(result.data,path + '.pageInfo'));
            }
        })();
    }, [data, fetchMore]);
    const edges = _get(data,path + '.edges',[]);
    return {
        data  : edges.map((item:any)=>item.node),
        loading,
        json : data,
    }
}
