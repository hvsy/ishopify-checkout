import {get as _get} from 'lodash-es';
import {gql, NetworkStatus, useQuery } from "@apollo/client";
import {useEffect, useRef} from "react";

export function useAllEdges(query : string,variables : any  ={},path : string, skip : boolean = false){
    const { data, loading, fetchMore, networkStatus } = useQuery(gql(query), {
        variables,
        notifyOnNetworkStatusChange: true,
        skip,
    });
    // 已请求过的游标集合：同一个游标最多请求一次，
    // 即使服务端返回的数据有异常也不会重复请求同一页形成死循环。
    const fetchedCursorsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        // 外部 refetch（切国家 / approve 后 CartLineItems 被 refetch）会把数据重置回
        // 第一页，旧的已请求游标集合不再适用。不清空会导致 hasNextPage 为真但游标
        // 命中集合被跳过，>first 条商品的列表永远停留在第一页。
        if (networkStatus === NetworkStatus.refetch) {
            fetchedCursorsRef.current.clear();
        }
    }, [networkStatus]);
    useEffect(() => {
        if (!data?.cart?.lines) return;

        const pageInfo = _get(data,path + '.pageInfo');
        if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) return;
        const cursor = pageInfo.endCursor;
        if (fetchedCursorsRef.current.has(cursor)) return;
        fetchedCursorsRef.current.add(cursor);

        // 每次只取一页，fetchMore 完成后 Apollo 会更新 data 并触发 effect
        // 重新运行，从而用新的 pageInfo/endCursor 继续取下一页，直到没有下一页。
        (async () => {
            try {
                await fetchMore({
                    // 查询声明的分页变量名是 $cursor（fragment 中为 lines(first:$first, after:$cursor)），
                    // 之前误传 after，导致每次请求都返回同一页：数据重复叠加且 hasNextPage 恒为 true。
                    variables: { cursor },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        if (!prev) return fetchMoreResult;
                        const prevEdges = prev.cart?.lines?.edges || [];
                        const newEdges = fetchMoreResult.cart?.lines?.edges || [];
                        const seen = new Set(
                            prevEdges.map((edge : any) => edge?.node?.id).filter(Boolean)
                        );
                        return {
                            cart: {
                                ...(fetchMoreResult.cart || {}),
                                lines: {
                                    ...(fetchMoreResult.cart?.lines || {}),
                                    edges: [
                                        ...prevEdges,
                                        ...newEdges.filter((edge : any) => !seen.has(edge?.node?.id)),
                                    ],
                                },
                            },
                        };
                    },
                });
            } catch (error) {
                // 单页失败时移除游标，等待后续数据变化再重试，而不是立即重复请求。
                fetchedCursorsRef.current.delete(cursor);
                console.error('fetchMore lines failed:', error);
            }
        })();
    }, [data, fetchMore, path]);
    const edges = _get(data,path + '.edges',[]);
    return {
        data  : edges.map((item:any)=>item.node),
        loading,
        json : data,
    }
}
