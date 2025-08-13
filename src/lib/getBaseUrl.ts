import {trimEnd as _trimEnd} from "lodash-es";

export function getBaseUrl() {
    if (import.meta.env.VITE_API) return import.meta.env.VITE_API;
    if (import.meta.env.VITE_BASE) return _trimEnd(import.meta.env.VITE_BASE, '/') + '/api/';
    return '/';
}
