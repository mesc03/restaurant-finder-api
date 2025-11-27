import axios from 'axios';
import { FoursquareParameters, Restaurant } from '../types';

const FOURSQUARE_API_URL = 'https://api.foursquare.com/v2/venues/search';
const API_VERSION = '20231010';

export async function searchRestaurants(params: FoursquareParameters): Promise<Restaurant[]> {
    if (!process.env.FOURSQUARE_CLIENT_ID || !process.env.FOURSQUARE_CLIENT_SECRET) {
        throw new Error('FOURSQUARE_CLIENT_ID and FOURSQUARE_CLIENT_SECRET must be set in .env');
    }

    try {
        const response = await axios.get(FOURSQUARE_API_URL, {
            params: {
                client_id: process.env.FOURSQUARE_CLIENT_ID,
                client_secret: process.env.FOURSQUARE_CLIENT_SECRET,
                v: API_VERSION,
                query: params.query,
                near: params.near,
                categoryId: '4d4b7105d754a06374d81259',
                limit: 5,
                ...(params.price && { price: params.price }),
                ...(params.open_now && { openNow: 1 })
            }
        });
        
        // show raw Foursquare response
        console.log('Raw Foursquare response:', JSON.stringify(response.data.response, null, 2));
        
        return (response.data.response.venues || []).map(formatRestaurant);
    } catch (error: any) {
        const msg = error.response?.data
        ? `Foursquare API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        : `Failed to search restaurants: ${error.message}`;
        throw new Error(msg);
    }
}

function formatRestaurant(venue: any): Restaurant {
    const loc = venue.location;
    const address = [loc?.address, loc?.city, loc?.state, loc?.country]
    .filter(Boolean)
    .join(', ') || 'Address not available';
    
    return {
        fsq_id: venue.id,
        name: venue.name,
        address: address,
        cuisine: venue.categories?.map((cat: any) => cat.name).join(', '),
        rating: venue.rating
    };
}