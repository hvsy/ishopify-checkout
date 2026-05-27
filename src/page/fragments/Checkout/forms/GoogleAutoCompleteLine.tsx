import {FC, useEffect, useRef} from "react";
import {Input, InputProps} from "../../../components/Input.tsx";
import {Search} from "lucide-react";
import  {
    usePlacesAutocomplete,
} from "places-autocomplete-hook";
import {useOnClickOutside, useScript} from "usehooks-ts";
import {getMetaContent} from "@lib/metaHelper.ts";
import {Loading} from "@components/fragments/Loading.tsx";

export type GoogleAutoCompleteLineProps = InputProps & {
    region_code : string;
    onAutoComplete ?: (address :NonNullable<ReturnType<typeof formatAddress>>)=>void;
};

const callback_name= "__google_auto_complete_callback__";
const googleMapKey = getMetaContent('google_map');
// const scriptUrl = googleMapKey ? `https://maps.googleapis.com/maps/api/js?key=${googleMapKey}&libraries=places&callback=${callback_name}` : null;

function formatAddress(address_components ?: any[]) {
    if(!address_components || !address_components.length) return null;
    const map  : any= {};
    for (const c of address_components) {
        for (const type of c.types) {
            map[type] = {long: c.longText, short: c.shortText};
        }
    }
    const getLong = (...keys : string[]) => {
        for (const k of keys) {
            if (map[k]) return map[k].long;
        }
        return '';
    };

    const getShort = (...keys : string[]) => {
        for (const k of keys) {
            if (map[k]) return map[k].short;
        }
        return '';
    };
    return {
        address1: [
            getLong('street_number'),
            getLong('route')
        ].filter(Boolean).join(' '),
        address2: [
            getLong('subpremise'),
            getLong('floor')
        ].filter(Boolean).join(', '),
        city: getLong(
            'locality',
            'postal_town',
            'sublocality_level_1',
            'administrative_area_level_2'
        ),
        state_code: getShort('administrative_area_level_1')?.toUpperCase(),
        postal_code: [
            getLong('postal_code'),
            getLong('postal_code_suffix')
        ].filter(Boolean).join('-'),
        region_code: getShort('country')?.toUpperCase(),
    };
}
export const GoogleAutoCompleteLine: FC<GoogleAutoCompleteLineProps> = (props) => {
    const {region_code,className,onChange,value:formValue,onAutoComplete,...others} = props;
    // const scriptStatus = useScript(scriptUrl,{
    //     shouldPreventLoad : false,
    //     id : 'google-map',
    //     removeOnUnmount : false,
    // })
    const {
        value,
        suggestions: {
            status, data ,
        },
        loading,
        getPlaceDetails,
        handlePlaceSelect,
        error,
        search,
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        apiKey : googleMapKey,
        includedRegionCodes : [region_code].filter(Boolean),
        // useLegacy: false,
        // callbackName : callback_name,
        // initOnMount: false,
        // requestOptions: {
        //
        //     componentRestrictions : {
        //         country : region_code,
        //     }
        //     /* Define search scope here */
        // },
        // debounce: 300,
    });
    // useEffect(() => {
    //     if(scriptStatus === 'ready'){
    //         init();
    //     }
    // }, [scriptStatus]);
    const ref = useRef<any>(null);
    useOnClickOutside(ref,() => {
        clearSuggestions();
    });
    const handleSelect = (suggestion : any) =>
            () => {
                // const { description } = suggestion;
                clearSuggestions();
                const detail = getPlaceDetails(suggestion.placeId, ['address_components',]).then((res : any) => {
                    import.meta.env.DEV && console.log("google map auto complete:",res);
                    // setValue(,false);
                    const final = formatAddress(res?.addressComponents || []);
                    if(final?.address1){
                        setValue(final.address1,false);
                    }
                    final && onAutoComplete?.(final);
                    // console.log('suggestion detail:',res,formatAddress(res?.address_components || []))
                })
                // console.log('select suggestion:',suggestion);
                // When the user selects a place, we can replace the keyword without request data from API
                // by setting the second parameter to "false"
                // setValue(description, false);

                // Get latitude and longitude via utility functions
                // getGeocode({ address: description }).then((results) => {
                //     const { lat, lng } = getLatLng(results[0]);
                //     console.log("📍 Coordinates: ", { lat, lng });
                // });
            };
    const renderSuggestions = () =>
        data.map((suggestion) => {
            const {
                placeId,
                structuredFormat : {secondaryText,mainText}
                // structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
                <div className={'py-1 px-1 cursor-pointer hover:bg-gray-300'} key={placeId} onClick={handleSelect(suggestion)}>
                    <strong>{mainText.text}</strong> <small>{secondaryText.text}</small>
                </div>
            );
        });
    return <div className={`relative ${className}`} ref={ref}>
        <Input onChange={(e) => {
                   setValue(e.target.value);
                   onChange?.(e)
               }}
               value={formValue}
               {...others}
            suffix={(!loading) ? <Search />: <Loading/> }
            autoComplete={'off'}
        />
        {status === "OK" && <div className={'absolute inset-x-0 bg-white p-0 shadow border-gray-200 border'} style={{
            top : '100%',
            zIndex : 1000,
        }}>
            <div className={'divide-y divide-gray-300'}>
                {renderSuggestions()}
            </div>
            <div className={'flex flex-row justify-end text-sm px-1'}>
                powered by Google
            </div>
        </div>}
    </div>
};
