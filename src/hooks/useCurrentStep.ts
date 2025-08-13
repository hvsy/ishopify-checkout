import {useParams} from "react-router-dom";

export function useCurrentStep(){
    const {action = 'information'} = useParams();
    return action || 'information';
}
