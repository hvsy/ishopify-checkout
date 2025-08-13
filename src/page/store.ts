import {create} from "zustand";

export type Address = {
    phone: string;
    first_name: string;
    last_name: string;
    address1: string;
    address2: string;
    city: string;
    region_id: number;
    state_id?: number;
    zip: string;
};
export type CheckoutState = {
    email?: string;
    discount_id?: number;
    shipping?: Address,
    billing?: Address
    shipping_method_id?: number;
    shipping_insurance?: number;
};
export const useCheckoutStore = create<{
    data: CheckoutState,
    update: (value: CheckoutState) => void,
}>()((set) => ({
    data: {},
    update: (value: CheckoutState) => {
        return set((state) => {
            return {
                data: {
                    ...state.data,
                    ...value,
                }
            }
        })
    }
}));
