import {FC, Fragment, memo} from "react";
import {Swatch} from "./Swatch.tsx";
import {ArrayHelper} from "../../lib/ArrayHelper";

export type SetSelectedOptionsCallback =  (selectedOptions : string[])=>string[];
export type ProductOptionsProps = {
    options ?: any[];
    selectedOptions ?: string[],
    setSelectedOptions ?: (callback : SetSelectedOptionsCallback)=>void,
    getDisabled ?: (index : number,value : string)=>boolean;
};

export const ProductOptions: FC<ProductOptionsProps> = memo((props) => {
    const {options,selectedOptions,setSelectedOptions,getDisabled} = props;
    return  <div className={'flex flex-col items-stretch space-y-8'}>
        {(options || []).map((option,optionIndex) => {
            const currentValue = selectedOptions?.[optionIndex];
            return <div key={option.name} className={'space-y-3 box-border'}>
                <div className={'uppercase flex flex-col justify-center'}>
                    {option.name}
                </div>
                <div className={'flex flex-row flex-wrap gap-3 pl-1'}>
                    {option.values.map((value : any) => {
                        const active = currentValue === value;
                        const disabled = !active && getDisabled?.(optionIndex,value) === true;
                        return <Swatch active={active}
                                       disabled={disabled}
                                       key={value}
                                       value={value}
                                       onClick={() => {
                                           setSelectedOptions?.((selectedOptions) => {
                                                return ArrayHelper.replace(selectedOptions,optionIndex,value);
                                           });
                                       }}
                        />
                    })}
                </div>
            </div>;
        })}
    </div>;
});
