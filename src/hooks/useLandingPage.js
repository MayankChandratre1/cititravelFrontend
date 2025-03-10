import { useState, useEffect } from 'react';
import axiosInstance from '../api/api';

const useLandingPage = () => {
    const [offers, setOffers] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [popular, setPopular] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLandingPageData = async () => {
            try {
                const [
                    offersResponse,
                    featuredResponse,
                    popularResponse,
                    bannersResponse
                ] = await Promise.all([
                    axiosInstance.get('/api/home/best-offers'),
                    axiosInstance.get('/api/home/featured-properties'),
                    axiosInstance.get('/api/home/popular-destinations'),
                    axiosInstance.get('/api/home/banners')
                ]);

                

                setOffers(offersResponse.data.data);
                setFeatured(featuredResponse.data.data);
                setPopular(popularResponse.data.data);
                setBanners(bannersResponse.data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLandingPageData();
    }, []);

    return {
        offers,
        featured,
        popular,
        banners,
        loading,
        error
    };
};

export default useLandingPage;
