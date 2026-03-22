import {getArrayFromMeta, getJsonFromMeta} from "./metaHelper.ts";

export const Features = getArrayFromMeta('features') || [];

export const isCN = (new Date()).getTimezoneOffset() === -480;

export const Setup = getJsonFromMeta('setup',null);
