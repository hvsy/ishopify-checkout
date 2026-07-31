import {useMemo} from "react";

const SHOPIFY_CDN_HOSTS = ['cdn.shopify.com', 'cdn.shopifycloud.com'];
const OSS_HOST_SUFFIXES = ['.aliyuncs.com'];
const OSS_CUSTOM_DOMAINS = new Set(['cdn.imshopify.com', 'cdn.imshopfly.com']);

function normalizeUrl(src: string): URL | null {
    try {
        const url = new URL(src);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null;
        }
        if (process.env.NODE_ENV === 'production' && url.protocol === 'http:') {
            url.protocol = 'https:';
        }
        return url;
    } catch {
        return null;
    }
}

function isShopifyCdn(host: string): boolean {
    return SHOPIFY_CDN_HOSTS.some(name => host === name || host.endsWith('.' + name));
}

function isOssHost(host: string): boolean {
    return OSS_CUSTOM_DOMAINS.has(host) || OSS_HOST_SUFFIXES.some(suffix => host.endsWith(suffix));
}

function isResizable(url: URL): boolean {
    return isShopifyCdn(url.hostname) || isOssHost(url.hostname);
}

export const ImageLoader = ({src, width, height, quality}: {
    src: string;
    width?: number;
    height?: number;
    quality?: number;
}) => {
    const url = normalizeUrl(src);
    if (!url) {
        return src;
    }

    if (isShopifyCdn(url.hostname)) {
        if (width) {
            url.searchParams.set('width', String(width));
        }
        if (height) {
            url.searchParams.set('height', String(height));
        }
        return url.toString();
    }

    if (!isOssHost(url.hostname)) {
        return src;
    }

    const resize: string[] = [];
    if (width) {
        resize.push(`w_${width}`);
    }
    if (height) {
        resize.push(`h_${height}`);
    }
    if (resize.length === 0) {
        return src;
    }

    const processes = [`resize,${resize.join(',')}`];
    if (quality) {
        processes.push(`quality,q_${quality}`);
    }
    url.searchParams.set('x-oss-process', `image/${processes.join('/')}`);
    return url.toString();
};

export const defaultDeviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export function useSrcSet(
    finalUrl?: string | null,
    deviceSizes: number[] = defaultDeviceSizes,
    maxWidth?: number,
) {
    return useMemo(() => {
        if (!finalUrl) {
            return undefined;
        }
        const url = normalizeUrl(finalUrl);
        if (!url || !isResizable(url)) {
            return undefined;
        }
        const sizes = [...new Set(deviceSizes)]
            .filter(size => Number.isFinite(size) && size > 0 && (!maxWidth || size <= maxWidth))
            .sort((a, b) => a - b);
        if (sizes.length === 0) {
            return undefined;
        }
        return sizes.map(size => {
            return `${ImageLoader({
                src: finalUrl,
                width: size,
            })} ${size}w`;
        }).join(', ');
    }, [finalUrl, deviceSizes, maxWidth]);
}
