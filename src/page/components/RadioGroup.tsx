import {ActivityProps, FC, ReactNode} from "react";
import {get as _get} from "lodash-es";

export type RadioGroupProps<T = any, V = any> = {
    value?: V,
    onChange?: (value: T, item: T) => void,
    renderItem?: (item: T, checked: boolean, radio: React.ReactElement) => React.ReactElement;
    items?: T[];
    valueAttr?: string;
    errors?: string[];
    onSelectedChange?: (value: T, item: T) => void;
    renderEmpty?: () => ReactNode;
};

export function RadioGroup<T, V = any>(props: RadioGroupProps<T, V>) {
    const {value, renderEmpty, errors = [], valueAttr, onSelectedChange, onChange, renderItem, items = []} = props;
    const methods = items || [];
    return <div className={'flex flex-col items-stretch'}>
        <div className={`flex flex-col items-stretch border input-border rounded-md divide-y-[0.5px]
                border-neutral-300 divide-neutral-300 overflow-hidden`}>
            {methods.length === 0 ? renderEmpty?.() : methods.map((item, i) => {
                const v = valueAttr ? _get(item, valueAttr, item) as T : item;
                const checked = v === value;
                const radio = checked ?
                    <div className={'w-4 h-4 rounded-full bg-indigo-800 flex flex-row justify-center items-center'}>
                        <div className={'w-1 h-1 rounded-full bg-white'}></div>
                    </div> : <div className={'w-4 h-4 rounded-full border border-neutral-300'}></div>;
                return <div className={'flex flex-row space-x-1 items-stretch'} key={i} onClick={() => {
                    onChange && onChange(v, item);
                    onSelectedChange?.(v, item);
                }}>
                    {renderItem?.(item, v === value, radio)}
                </div>
            })}
        </div>
    </div>;
}
