import {FC} from "react";
import {FloatLabel, FloatLabelProps} from "./FloatLabel";

export type InputProps = FloatLabelProps;

export const Input: FC<InputProps> = (props) => {
    return <FloatLabel {...props} element={'input'}/>
};
