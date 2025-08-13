import React, {FC, ReactNode,} from "react";
import {useCountdown} from "@hooks/useCountDown";
import {padStart as _padStart} from "lodash-es";
import {twMerge} from "tailwind-merge"
import {Line} from "./Line";

export type CountDownProps = {
    milliseconds: number;
    format?: string;
    name: string;
    expired?: ReactNode;
    className?: string;
    auto?: boolean;
    loop?: boolean;
    containerClassName ?: string;
    prefix ?: ReactNode;
    suffix ?: ReactNode;
};

function formatTime(time: number) {
    const second = Math.floor(time / 1000);
    const milli = time % 1000;
    const after = [];
    let i = 0;
    let next = second;
    do {
        after.push(_padStart((next % 60) + '', 2, '0'));
        next = Math.floor(next / 60);
        ++i;
    } while (i < 3);
    return [...(after.reverse()), milli] as number[];
}

export const REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|S{1,2}/g

export const CountDown :FC<CountDownProps> =  (props) => {
    const {milliseconds,prefix = null,suffix = null,containerClassName = '', loop = false, auto = false, format = 'mm:ss.S', expired, className = ''} = props;
    const precision = format.indexOf('S') === -1 ? 0 : (format.indexOf('SS') === -1 ? 1 : 2);
    const {countdown} = useCountdown(milliseconds, {precision, auto, loop});
    if (expired && countdown == 0) return expired;
    const [hour, minute, second, milli] = formatTime(countdown);
    const matches = (match: string) => {
        switch (match) {
            case 'm':
            case 'mm': {
                return _padStart(minute + '', match.length, '0');
            }
            case 's':
            case 'ss': {
                return _padStart(second + '', match.length, '0');
            }
            case 'S':
            case 'SS':
                return _padStart(Math.floor(milli / Math.pow(10, 3 - match.length)) + '', match.length, '0')
            case 'H':
            case 'HH':
                return _padStart(hour + '', match.length, '0')
            default:
                return match;
        }
    };
    const content = format.replace(REGEX_FORMAT, (match, $1) => $1 || matches(match))
    return <Line
        className={twMerge(`space-x-2 text-red-500 select-none ${containerClassName}`)}
        suffix={suffix}
        prefix={prefix}
    >
        <div
            className={twMerge(`select-none rounded-md text-white bg-red-500 px-2 tracking-wider font-mono ${className}`)}>
            {content}
        </div>
    </Line>
};
