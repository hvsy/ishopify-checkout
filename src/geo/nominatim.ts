import {format_address, GeoAddress} from "./GeoAddress.ts";
import axios from "axios";
import {isArray} from "lodash-es";
//@ts-ignore
import jsonp from "axios-jsonp";

export async function Nominatim(address : GeoAddress){
    const search = format_address(address,true);
    try{
        import.meta.env.DEV && console.log('nominatim search:',search);
        const url = `https://nominatim.openstreetmap.org/search?q=${search}&format=json&limit=1&addressdetails=1`;
        //@ts-ignore
        const json = await axios({
            adapter: jsonp,
            callbackParamName : 'json_callback',
            timeout : 3000,
            url,
            headers : {
                'User-Agent' : 'My Checkout',
            }
        }).then(r=>r.data);
        if(!isArray(json)){
            import.meta.env.DEV && console.error(json);
            return [];
        }
        return json.map((item : any) => {
            import.meta.env.DEV && console.log('suggest item:',item);
            const country_code = item.address.country_code;
            const state_code = item.address['ISO3166-2-lvl4']?.replace(country_code?.toUpperCase()+'-','');
            return {
                "coordinates" : {
                    x : item.lat,
                    y : item.lon,
                },
                'address' : {
                    zip : item.address.postcode,
                    street : item.address,
                    state_code : state_code,
                    state : item.address.state,
                    city : item.address.city,
                    suggest : item.display_name,
                }
            }
        })
    }catch (e){
        import.meta.env.DEV && console.error(e);
        return [];
    }
}

export default Nominatim;
