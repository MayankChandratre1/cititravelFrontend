import React, { useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import DetailsModal from './DetailsModal';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/api';
import { useHotel } from '../../context/HotelContext';

const ITEMS_PER_PAGE = 5;

const HotelList = ({ results, filters }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { setHotelDetails } = useHotel();

    if (!results?.GetHotelAvailRS?.HotelAvailInfos?.HotelAvailInfo) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No hotels found matching your criteria.</p>
            </div>
        );
    }

    const hotels = results.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo;
    const totalItems = hotels.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Get current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return hotels.slice(startIndex, endIndex);
    };

    const renderPaginationButtons = () => {
        const isMobile = window.innerWidth < 768;
        let pagesToShow = [];

        if (isMobile) {
            // On mobile, show current page, previous and next if available
            if (totalPages <= 3) {
                pagesToShow = [...Array(totalPages)].map((_, i) => i + 1);
            } else {
                if (currentPage === 1) {
                    pagesToShow = [1, 2, '...', totalPages];
                } else if (currentPage === totalPages) {
                    pagesToShow = [1, '...', totalPages - 1, totalPages];
                } else {
                    pagesToShow = [currentPage - 1, currentPage, currentPage + 1];
                }
            }
        } else {
            // On desktop, show more page numbers
            if (totalPages <= 7) {
                pagesToShow = [...Array(totalPages)].map((_, i) => i + 1);
            } else {
                if (currentPage <= 3) {
                    pagesToShow = [1, 2, 3, 4, '...', totalPages];
                } else if (currentPage >= totalPages - 2) {
                    pagesToShow = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                } else {
                    pagesToShow = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                }
            }
        }

        return pagesToShow.map((page, idx) => (
            <button
                key={idx}
                onClick={() => page !== '...' && setCurrentPage(page)}
                className={`px-3 py-1 rounded border min-w-[40px] ${
                    page === '...' 
                        ? 'border-none cursor-default' 
                        : page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white hover:bg-gray-50'
                }`}
                disabled={page === '...'}
            >
                {page}
            </button>
        ));
    };

    const handleViewDetails = async (hotel) => {
        try {
            const rateKey = hotel.HotelRateInfo.RateInfos?.ConvertedRateInfo?.[0]?.RateKey;
            
            const payload = {
                HotelPriceCheckRQ: {
                    
                    RateInfoRef: {
                        RateKey: rateKey,
                        StayDateTimeRange: {
                            StartDate:  hotel.HotelRateInfo?.RateInfos?.ConvertedRateInfo[0]?.StartDate,
                            EndDate:  hotel.HotelRateInfo?.RateInfos?.ConvertedRateInfo[0]?.EndDate
                        },
                        Rooms: {
                            Room: [
                                {
                                    Index: 1,
                                    Adults: 1,
                                    Children: 0
                                }
                            ]
                        }
                    }
                }
            };

            

            const response = await axiosInstance.post('/api/v1/sabre/hotels/details', payload);
            console.log('Hotel Details Response:', response.data);
            setHotelDetails(response.data);

            navigate(`/hotel/${hotel.HotelInfo.HotelCode}`, {
                state: { 
                    hotelDetails: hotel
                }
            });
        } catch (error) {
            console.error('Error fetching hotel details:', error);
            navigate(`/hotel/${hotel.HotelInfo.HotelCode}`, {
                state: { hotelDetails: hotel }
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* Pagination Info */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <p className="text-sm text-gray-600 order-2 md:order-1">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} hotels
                </p>
                <div className="flex gap-2 order-1 md:order-2 w-full md:w-auto justify-center">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border ${
                            currentPage === 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <span className="hidden md:inline">Previous</span>
                        <span className="inline md:hidden">←</span>
                    </button>
                    <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
                        {renderPaginationButtons()}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded border ${
                            currentPage === totalPages 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <span className="hidden md:inline">Next</span>
                        <span className="inline md:hidden">→</span>
                    </button>
                </div>
            </div>

            {/* Hotel Cards */}
            {getCurrentPageItems().map(hotel => {
                const hotelInfo = hotel.HotelInfo;
                const rateInfo = hotel.HotelRateInfo;
                const amenities = hotelInfo.Amenities?.Amenity || [];
                const lowestRate = rateInfo.RateInfos?.ConvertedRateInfo?.[0];
                const hotelImage = hotel?.HotelImageInfo?.ImageItem?.Image?.Url || "https://www.placeholder.co/400x400"

                return (
                    <div key={hotelInfo.HotelCode} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Hotel Image - Using placeholder for now */}
                            <div className="md:w-1/3 h-48 md:h-auto">
                                <img
                                    src={`${hotelImage}`}
                                    alt={hotelInfo.HotelName}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Hotel Details */}
                            <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{hotelInfo.HotelName}</h3>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <MapPin size={16} />
                                                {hotelInfo.LocationInfo.Address.AddressLine1}, 
                                                {hotelInfo.LocationInfo.Address.CityName.value}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-2xl font-bold">
                                                {lowestRate?.CurrencyCode} {lowestRate?.AverageNightlyRate}
                                            </p>
                                            <p className="text-gray-500">per night</p>
                                        </div>
                                    </div>

                                    {/* Star Rating */}
                                   {hotelInfo.SabreRating != "NA" && <div className="mt-2 flex items-center gap-2">
                                        {[...Array(Math.floor(Number(hotelInfo.SabreRating ?? 0)))].map((_, i) => (
                                            <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                                        ))}
                                    </div>}

                                    {/* Amenities */}
                                    <div className="mt-4">
                                        <p className="text-gray-600">
                                            {amenities
                                                .slice(0, 5)
                                                .map(a => a.Description)
                                                .join(" • ")}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    {/* Hotel Chain/Brand */}
                                    <div className="flex items-center gap-2">
                                        {hotelInfo.ChainName && (
                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                {hotelInfo.ChainName}
                                            </div>
                                        )}
                                        <span className="text-gray-600">{hotelInfo.Distance} {hotelInfo.UOM} away</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleViewDetails(hotel)}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Details Modal */}
            {showModal && (
                <DetailsModal
                    hotel={selectedHotel}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* Bottom Pagination */}
            <div className="flex justify-center mt-6">
                <div className="flex gap-2 w-full md:w-auto justify-center">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border ${
                            currentPage === 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <span className="hidden md:inline">Previous</span>
                        <span className="inline md:hidden">←</span>
                    </button>
                    <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
                        {renderPaginationButtons()}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded border ${
                            currentPage === totalPages 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                        <span className="hidden md:inline">Next</span>
                        <span className="inline md:hidden">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelList;
