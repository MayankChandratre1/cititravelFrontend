import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/api";

const useAirports = (initialQuery = '') => {
    const [query, setQuery] = useState(initialQuery);
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const timeoutRef = useRef(null);

    const fetchAirports = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setAirports([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.post(`/api/v1/sabre/airports?query=${searchQuery}`);
            
            setAirports(
                response.data?.grouped["category:AIR"].doclist.docs.map((airport) => ({
                    code: airport.iataCityCode,
                    name: airport.name,
                    city: airport.city,
                    country: airport.country,
                }))
            );
        } catch (err) {
            setError('Failed to fetch airports');
            setAirports([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback((searchQuery) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            fetchAirports(searchQuery);
        }, 300);
    }, [fetchAirports]);

    useEffect(() => {
        debouncedSearch(query);

   
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query, debouncedSearch]);

    const clearAirports = useCallback(() => {
        setAirports([]);
        setQuery('');
    }, []);

    return {
        query,
        setQuery,
        airports,
        loading,
        error,
        clearAirports,
        searchAirports: debouncedSearch,
    };
};

export default useAirports;