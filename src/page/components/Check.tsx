import {FC} from "react";
import {Checkbox} from "@components/ui/checkbox.tsx";

export type CheckProps = {value ?: boolean; onChange ?: (checked : boolean)=>void,id ?: string};

export const Check: FC<CheckProps> = (props) => {
    const {value,onChange,...others} = props;
    return <Checkbox checked={value} onCheckedChange={onChange} {...others}/>;
};
