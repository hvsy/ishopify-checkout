import { useMediaQuery } from "react-responsive";

export const Desktop= ({ children } : any) => {
    const isDesktop = useMediaQuery({ minWidth: 992 })
    return isDesktop ? children : null
};
export const Tablet = (({ children } : any) => {
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
    return isTablet ? children : null
});
export const Mobile= (({ children } : any) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    if(!isMobile) return null;
    return children;
});
export const Default= ({ children } : any) => {
    const isNotMobile = useMediaQuery({ minWidth: 768 })
    if(!isNotMobile) return null;
    return children;
};
