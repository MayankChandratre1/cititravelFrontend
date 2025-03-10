import { useContext } from 'react';
import FlightContext from '../context/FlightContext';

const useFlightSearch = () => {
    const context = useContext(FlightContext);
    
    if (!context) {
        throw new Error('useFlightSearch must be used within a FlightProvider');
    }
    
    const { state, searchFlights, updateSearchParams, updateRevalidationResults, sendRevalidation } = context;
    
    return {
        searchParams: state.searchParams,
        searchResults: state.searchResults,
        revalidationResults: state.revalidationResults,  // Make sure this is exposed
        loading: state.loading,
        error: state.error,
        searchFlights,
        updateSearchParams,
        updateRevalidationResults,
        sendRevalidation,
        revalidationLoading: state.revalidationLoading,
        revalidationError: state.revalidationError
    };
};

export default useFlightSearch;
