import {getArrayFromMeta, getJsonFromMeta} from "./metaHelper.ts";

export const Features = getArrayFromMeta('features') || [];
import.meta.env.DEV && console.log("meta config checkout features:",Features);

export const isCN = (new Date()).getTimezoneOffset() === -480;

export const Setup = getJsonFromMeta('setup',null);
import.meta.env.DEV && console.log("meta config setup:",Setup);
