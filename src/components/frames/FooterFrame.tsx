import {FC} from "react";
import {Link, LinkProps} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import {AsyncButton} from "../fragments/AsyncButton.tsx";
import {Skeleton} from "../ui/Skeleton.tsx";

export type FooterFrameProps = {
    back ?: {
        to : LinkProps['to'];
        reload ?: boolean;
        label ?: string;
    },
    next ?:{
        onClick ?: ()=>Promise<any>,
        label ?: string;
        pulsing ?: boolean;
    }
};

export const FooterFrame: FC<FooterFrameProps> = (props) => {
    const {back,next} = props;
    const left  = back && <Link className={'text-sm space-x-2 flex flex-row mt-8 sm:mt-0 justify-center items-center cursor-pointer'}
                                to={back.to}
                                reloadDocument={back.reload || false}
    >

        {!import.meta.env.VITE_SKELETON &&  <ChevronLeft size={'16px'}/>}
        {import.meta.env.VITE_SKELETON ?<Skeleton className={'min-w-36 min-h-5'}/> : <div>Return to {back?.label}</div>}
    </Link>;
    return <div className={'flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center'}>
        {left}
        <AsyncButton onClick={next?.onClick}  pulsing={next?.pulsing || false} className={'max-w-full'}>
            {next?.label}
        </AsyncButton>
    </div>;
};
