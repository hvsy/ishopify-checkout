import {FC, ReactNode, useState} from "react";
import {TooltipContent,Tooltip as Tip,TooltipProvider, TooltipTrigger} from "../ui/tooltip";
import {TooltipArrow} from "@radix-ui/react-tooltip";

export type TooltipProps = {
    children ?:ReactNode;
    icon ?: ReactNode;
};

export const Tooltip: FC<TooltipProps> = (props) => {
    const [open, setOpen] = useState(false)
    const {children,icon} = props;

    return <TooltipProvider delayDuration={100}

    >
        <Tip open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild onClick={() => {
                setOpen(true)
            }}>
                <div>
                    {icon}
                </div>
            </TooltipTrigger>
            <TooltipContent className={'text-white bg-black'} arrowPadding={10}
            >
                <div>
                    {children}
                </div>
                <TooltipArrow className="-top-2" />
            </TooltipContent>
        </Tip>
    </TooltipProvider>;
};
