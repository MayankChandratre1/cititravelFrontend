import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Home/Navbar';
import ItineraryList from '../components/Account/ItineraryList';
import axiosInstance from '../api/api';

const Account = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [itineraries, setItineraries] = useState([]);

    const fetchItinerary = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/v1/user/getItinirary');
            setItineraries(response.data.it || []);
        } catch (error) {
            console.error('Error fetching itinerary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchItinerary();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className='bg-blue-600 py-4 fixed top-0 left-0 right-0 z-30'>
                <Navbar highlight={"white"} activeTab={"none"} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
                {/* User Profile Section */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">My Account</h1>
                            <p className="text-sm sm:text-base text-gray-600">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Itinerary Section */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold mb-6">My Itineraries</h2>
                    <ItineraryList itineraries={itineraries} />
                </div>
            </div>
        </div>
    );
};

export default Account;