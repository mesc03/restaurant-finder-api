import axios from 'axios';
import {FoursquareParameters, Restaurant} from '../types';

const FOURSQUARE_API_URL = 'https://api.foursquare.com/v3/places/search';

export async function searchRestaurants(params: FoursquareParameters): Promise<Restaurant[]> {
    if (!process.env.FOURSQUARE_API_KEY) {
        throw new Error('FOURSQUARE_API_KEY is not in .env or api is not set');
    }

    try {
        const response = await axios.get(FOURSQUARE_API_URL, {
            headers: {
                'Authorization': process.env.FOURSQUARE_API_KEY,
                'Accept': 'application/json'
            },
            params: {
                query: params.query,
                near: params.near,
                categories: '13000', 
                limit: 5,
                ...(params.price && { price: params.price }),
                ...(params.open_now && { open_now: true })
            }
        });
        
        return (response.data.results || []).map(formatRestaurant);
    } catch (error: any) {
        const msg = error.response
        ? `Foursquare API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        : `Failed to search restaurants: ${error.message}`;
        console.error(msg);
        throw new Error(msg);
    }
}

function formatRestaurant(place: any): Restaurant {
    return {
        fsq_id: place.fsq_id,
        name: place.name,
        address: place.location?.formatted_address || 'Address not available',
        cuisine: place.categories?.map((cat: any) => cat.name).join(', '),
        rating: place.rating
    };
}