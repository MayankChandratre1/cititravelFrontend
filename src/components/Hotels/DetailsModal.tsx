import React from 'react';
import { X, MapPin, Star, Wifi, Coffee, Car, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DetailsModalProps {
    hotel: any;
    onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ hotel, onClose }) => {
    const navigate = useNavigate();
    const hotelInfo = hotel.HotelInfo;
    const rateInfo = hotel.HotelRateInfo;
    const lowestRate = rateInfo.RateInfos?.ConvertedRateInfo?.[0];
    const amenities = hotelInfo.Amenities?.Amenity || [];

    const handleBooking = () => {
        // Add booking logic here
        navigate('/checkout', { 
            state: { 
                hotelBooking: true,
                hotelDetails: hotel 
            } 
        });
    };

    return (
        <div className="fixed inset-0 -top-5 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
                {/* Background overlay */}
                <div className="fixed inset-0" onClick={onClose}></div>

                {/* Modal container */}
                <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Hotel images */}
                    <div className="h-[300px] md:h-[400px] w-full relative bg-gray-200">
                        <img
                            src={hotel?.HotelImageInfo?.ImageItem?.Image?.Url || "https://via.placeholder.com/800x400"}
                            alt={hotelInfo.HotelName}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Content container */}
                    <div className="p-6 md:p-8">
                        {/* Header section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{hotelInfo.HotelName}</h2>
                                    <p className="flex items-center text-gray-600 mb-2">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        {hotelInfo.LocationInfo.Address.AddressLine1}, 
                                        {hotelInfo.LocationInfo.Address.CityName.value}
                                    </p>
                                    {hotelInfo.SabreRating !== "NA" && (
                                        <div className="flex items-center gap-1">
                                            {[...Array(Math.floor(Number(hotelInfo.SabreRating)))].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {lowestRate?.CurrencyCode} {lowestRate?.AverageNightlyRate}
                                    </p>
                                    <p className="text-gray-500">per night</p>
                                </div>
                            </div>
                        </div>

                        {/* Main content grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left column */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Property Highlights</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {amenities.slice(0, 6).map((amenity, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 min-w-[20px] text-green-500 mt-0.5" />
                                            <span className="text-gray-700">{amenity.Description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right column */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Location Details</h3>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                        {hotelInfo.Distance} {hotelInfo.UOM} from city center
                                    </p>
                                    {hotelInfo.ChainName && (
                                        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                            {hotelInfo.ChainName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Room Information</h3>
                            {rateInfo.Rooms?.Room?.map((room, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h4 className="font-medium">{room.RoomDescription?.Name}</h4>
                                    <p className="text-gray-600">{room.RoomDescription?.Text?.[0]}</p>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 text-center"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleBooking}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1 text-center"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;