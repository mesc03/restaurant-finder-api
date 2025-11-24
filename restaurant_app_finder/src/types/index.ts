export interface RestaurantCommand {
    action: 'restaurant_search';
    parameters: FoursquareParameters;
}

export interface FoursquareParameters {
    query: string;
    near: string;
    price?: string;
    open_now?: boolean;
}

export interface Restaurant {
    fsq_id: string;
    name: string;
    address: string;
    cuisine?: string;
    rating?: number;

}