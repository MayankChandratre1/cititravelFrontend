import React, { createContext, useReducer, useContext } from 'react';
import axiosInstance from '../api/api';

const initialState = {
    searchParams: {
        location: '',
        checkIn: '',
        checkOut: '',
        rooms: [{
            adults: 1,
            children: 0
        }],
        SearchCriteria: {
            OffSet: 1,
            SortOrder: "ASC",
            PageSize: 20
        }
    },
    searchResults: null,
    loading: false,
    error: null,
    selectedHotel: null,
    hotelDetails: null
};

const HotelContext = createContext(undefined);

const hotelReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_SEARCH_PARAMS':
            return {
                ...state,
                searchParams: { ...state.searchParams, ...action.payload }
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_SEARCH_RESULTS':
            return { ...state, searchResults: action.payload };
        case 'SET_SELECTED_HOTEL':
            return { ...state, selectedHotel: action.payload };
        case 'SET_HOTEL_DETAILS':
            return { ...state, hotelDetails: action.payload };
        default:
            return state;
    }
};

export const HotelProvider = ({ children }) => {
    const [state, dispatch] = useReducer(hotelReducer, initialState);

    const searchHotels = async (params) => {
        
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const formattedParams = params;

            const response = await axiosInstance.post('/api/v1/sabre/hotels/search', formattedParams);
            
            dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const getHotelDetails = async (hotelId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await axiosInstance.get(`/api/v1/hotels/${hotelId}`);
            dispatch({ type: 'SET_HOTEL_DETAILS', payload: response.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateSearchParams = (params) => {
        dispatch({ type: 'UPDATE_SEARCH_PARAMS', payload: params });
    };

    const selectHotel = (hotel) => {
        dispatch({ type: 'SET_SELECTED_HOTEL', payload: hotel });
    };

    const setHotelDetails = (details) => {
        dispatch({ type: 'SET_HOTEL_DETAILS', payload: details });
    };

    return (
        <HotelContext.Provider 
            value={{ 
                state, 
                searchHotels, 
                getHotelDetails, 
                updateSearchParams,
                selectHotel,
                setHotelDetails,
                hotelDetails: state.hotelDetails
            }}
        >
            {children}
        </HotelContext.Provider>
    );
};

// Custom hook for using hotel context
export const useHotel = () => {
    const context = useContext(HotelContext);
    if (context === undefined) {
        throw new Error('useHotel must be used within a HotelProvider');
    }
    return context;
};

export default HotelContext;
