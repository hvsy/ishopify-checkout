import {uniq,isArray,get} from "lodash-es";
import axios from "axios";
//@ts-ignore
import jsonp from "axios-jsonp";
import {format_address, GeoAddress} from "./GeoAddress.ts";

export let countries : string[] = [
    'US','UM',
];
function formatSuggest(address : string){
    try {
        const [street, city, state, zip] = address.split(',');
        return {street, city, state, zip};
    } catch (e) {
        import.meta.env.DEV && console.error(e);
        return null;
    }
}
export async function Census(address : GeoAddress){
    if(!countries.includes(address.region_code.toUpperCase())){
        return null;
    }
    let encoded = format_address(address);
    try {
        const json = await axios({
            url : `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encoded}&benchmark=Public_AR_Current&format=json`,
            timeout : 3000,
            adapter: jsonp,
        }).then(r=>r.data);
        const matches = get(json,'result.addressMatches',[]);
        if(!isArray(matches)){
            import.meta.env.DEV && console.error(json,matches);
            return [];
        }
        return matches.map((match: any) => {
            return {
                "coordinates": match.coordinates,
                'address' : {
                    zip : match.addressComponents.zip,
                    street : match.addressComponents.streetName,
                    state : null,
                    state_code : match.addressComponents.state,
                    city : match.addressComponents.city,
                    suggest : formatSuggest(match.matchedAddress),
                }
            }
        })
    } catch (e) {
        import.meta.env.DEV && console.error(e);
        return [];
    }
}

export default Census;
