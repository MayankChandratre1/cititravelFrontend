import { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import axiosInstance from '../api/api';

const useHotels = () => {
    const { 
        state: { searchResults, searchParams, selectedHotel, hotelDetails }, 
        searchHotels, 
        getHotelDetails,
        updateSearchParams,
        selectHotel
    } = useHotel();

    const [cities, setCities] = useState(new Set());
    const [amenities, setAmenities] = useState(new Set());
    const [propertyTypes, setPropertyTypes] = useState(new Set());

    const getCityDetails = async (cities) => {
        try {
            const cityDetails = await axiosInstance.post('/api/v1/sabre/geocodes', {
                codes: cities,
                type: "CITY"
            });
            setCities(new Set(cityDetails.data.Response));
            return cityDetails.data.Response;
        } catch (e) {
            console.log(e);
            return [];
        }
    };

    useEffect(() => {
        if (searchResults?.PropertyList) {
            const newCities = new Set();
            const newAmenities = new Set();
            const newPropertyTypes = new Set();

            searchResults.PropertyList.forEach(property => {
                // Collect cities
                if (property.Address?.CityName) {
                    newCities.add(property.Address.CityName);
                }

                // Collect amenities
                property.PropertyInfo?.Amenities?.forEach(amenity => {
                    newAmenities.add(amenity.Code);
                });

                // Collect property types
                if (property.PropertyInfo?.PropertyType) {
                    newPropertyTypes.add(property.PropertyInfo.PropertyType);
                }
            });

            getCityDetails(Array.from(newCities));
            setAmenities(newAmenities);
            setPropertyTypes(newPropertyTypes);
        }
    }, [searchResults]);

    const formatPrice = (price, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    };

    const getRoomDetails = (property) => {
        return {
            price: property.RateInfo?.StartingPrice,
            currency: property.RateInfo?.Currency || 'USD',
            roomTypes: property.RateInfo?.RoomTypes || [],
            availability: property.RateInfo?.Availability
        };
    };

    const getPropertyAmenities = (property) => {
        return property.PropertyInfo?.Amenities?.map(amenity => ({
            code: amenity.Code,
            description: amenity.Description
        })) || [];
    };

    const getPropertyLocation = (property) => {
        return {
            address: property.Address?.AddressLine1,
            city: property.Address?.CityName,
            state: property.Address?.StateCode,
            country: property.Address?.CountryCode,
            postalCode: property.Address?.PostalCode,
            coordinates: {
                latitude: property.GeoLocation?.Latitude,
                longitude: property.GeoLocation?.Longitude
            }
        };
    };

    return {
        searchResults,
        searchParams,
        selectedHotel,
        hotelDetails,
        cities: Array.from(cities),
        amenities: Array.from(amenities),
        propertyTypes: Array.from(propertyTypes),
        searchHotels,
        getHotelDetails,
        updateSearchParams,
        selectHotel,
        formatPrice,
        getRoomDetails,
        getPropertyAmenities,
        getPropertyLocation
    };
};

export default useHotels;
