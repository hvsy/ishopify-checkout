import {gql, useMutation} from "@apollo/client";
import {MutateShippingAddress} from "@query/checkouts/mutations.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment
} from "@query/checkouts/fragments/fragments.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";

export function useUpdateContactInformation(){
    const storage = useCartStorage();
    const [fn] = useMutation(gql([
        MutateShippingAddress,
        QueryCartFieldsFragment,
        QueryDeliveryFragment,
        // QueryLineItemsFragment,
        // QueryVariantFragment,
        // QueryImageFragment,
        QueryBuyerIdentityFragment,
    ].join("\n")),{
        refetchQueries : ['Summary','ShippingMethods','CartLineItems'],
        awaitRefetchQueries : true,
        update(cache){
            cache.modify({
                id: cache.identify({ __typename: 'Cart', id: storage.gid}),
                fields: {
                    deliveryGroups() {
                        return null;
                    }
                }
            });
            // console.log('cache:',cache);
        },
        variables : {
            cartId : storage.gid,
        }
    });
    return fn;
}
