import React, { createContext, useReducer, useContext } from 'react';
import axiosInstance from '../api/api';

const initialState = {
    searchParams: {
        pickupLocation: '',
        dropoffLocation: '',
        pickupDate: '',
        dropoffDate: '',
        sameLocation: true
    },
    searchResults: null,
    loading: false,
    error: null,
    selectedCar: null,
    carDetails: null
};

const CarContext = createContext(undefined);

const carReducer = (state, action) => {
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
        case 'SET_SELECTED_CAR':
            return { ...state, selectedCar: action.payload };
        default:
            return state;
    }
};

export const CarProvider = ({ children }) => {
    const [state, dispatch] = useReducer(carReducer, initialState);

    const searchCars = async (params) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await axiosInstance.post('/api/v1/sabre/cars/search', params);
            dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateSearchParams = (params) => {
        dispatch({ type: 'UPDATE_SEARCH_PARAMS', payload: params });
    };

    const selectCar = (car) => {
        dispatch({ type: 'SET_SELECTED_CAR', payload: car });
    };

    return (
        <CarContext.Provider value={{ 
            state, 
            searchCars, 
            updateSearchParams,
            selectCar
        }}>
            {children}
        </CarContext.Provider>
    );
};

export const useCar = () => {
    const context = useContext(CarContext);
    if (context === undefined) {
        throw new Error('useCar must be used within a CarProvider');
    }
    return context;
};

export default CarContext;
