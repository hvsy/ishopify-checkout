import {getFinalPath} from "./api.ts";

export function getCartGid(token?: string, key?: string | null): string {
    return `gid://shopify/Cart/${token || ''}?key=${key || ''}`;
}

export function getCartApi(token?: string, shop?: string): string {
    return getFinalPath(`/api/checkouts/${token || ''}`, shop);
}

export function getCartBeacon(token?: string, shop?: string): string {
    return getFinalPath(`/checkouts/${token || ''}/beacon`, shop);
}
