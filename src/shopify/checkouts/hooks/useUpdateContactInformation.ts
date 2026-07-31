import {gql, useMutation} from "@apollo/client";
import {MutateShippingAddress} from "@query/checkouts/mutations.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment
} from "@query/checkouts/fragments/fragments.ts";
import {useCart} from "@hooks/useCart.ts";

export function useUpdateContactInformation(){
    const {gid} = useCart();
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
                id: cache.identify({ __typename: 'Cart', id: gid}),
                fields: {
                    deliveryGroups() {
                        return null;
                    }
                }
            });
            // console.log('cache:',cache);
        },
        variables : {
            cartId : gid,
        }
    });
    return fn;
}
