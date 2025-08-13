import {FC, ReactNode, useEffect, useState} from "react";

export type LazyRenderProps = {
    render ?: ()=>ReactNode;
};

export const LazyRender: FC<LazyRenderProps> = (props) => {
    const {render} = props;
    const [mount,setMount] = useState(false);
    useEffect(() => {
        setMount(true);
    }, []);
    if(!mount) return null;
    return render?.();
};
