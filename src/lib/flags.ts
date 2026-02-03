import {getArrayFromMeta} from "./metaHelper.ts";

export const Features = getArrayFromMeta('features') || [];

export const isCN = (new Date()).getTimezoneOffset() === -480;
