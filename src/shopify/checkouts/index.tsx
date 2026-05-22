import {Right} from "./fragments/Right.tsx";
import {Left} from "./fragments/Left.tsx";
import {PageFrame} from "@components/frames/PageFrame.tsx";
import {ErrorBoundary} from "react-error-boundary";
import {UNSAFE_useRouteId} from "react-router-dom";
import {Produce} from "../fragments/Produce.tsx";
import {Beacon} from "../fragments/Beacon.tsx";
// import {Nav} from "../fragments/SiteNav.tsx";


export default () => {
    const id = UNSAFE_useRouteId();

    return <><PageFrame
        // renderNav={()=><Nav/>}
        renderRight={() => {
            return <ErrorBoundary onError={(error, info) => {
                console.error(error, info);
            }} fallback={null}>
                <Right/>
            </ErrorBoundary>
        }}
        renderLeft={() => {
            return <ErrorBoundary onError={(error, info) => {
                console.error(error, info);
            }} fallback={null}>
                <Left/>
            </ErrorBoundary>
        }}/>
        <ErrorBoundary fallback={null} onError={() => {

        }}>
            <Produce event={id === 'approve' ? 'approved' : 'loaded'}/>
            <Beacon context={id}/>
        </ErrorBoundary>
    </>
}
