import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Wifi, Coffee, Car, Check, Users } from 'lucide-react';
import Navbar from '../components/Home/Navbar';
import { useHotel } from '../context/HotelContext';

const HotelDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hotelDetails } = useHotel();
    const hotel = location.state?.hotelDetails;

    if (!hotel) {
        navigate('/hotel');
        return null;
    }

    const hotelInfo = hotel.HotelInfo;
    const rateInfo = hotel.HotelRateInfo;
    const lowestRate = rateInfo.RateInfos?.ConvertedRateInfo?.[0];
    const amenities = hotelInfo.Amenities?.Amenity || [];

    const detailedInfo = hotelDetails?.hotel?.HotelPriceCheckRS?.PriceCheckInfo;
    const roomDetails = detailedInfo?.HotelRateInfo?.Rooms?.Room?.[0] || {};
    const ratePlan = roomDetails?.RatePlans?.RatePlan?.[0] || {};

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="bg-blue-600 py-4 fixed inset-0 h-fit z-20">
                <Navbar highlight="white" activeTab="Hotel" />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Image Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="h-[400px]">
                        <img
                            src={hotel?.HotelImageInfo?.ImageItem?.Image?.Url || "/HotelPlaceholder.svg"}
                            alt={hotelInfo.HotelName}
                            className="w-full h-full object-cover rounded-lg object-top"
                        />
                    </div>
                
                </div>

                {/* Hotel Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold mb-2">{hotelInfo.HotelName}</h1>
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

                            <div className="space-y-6">
                                <section>
                                    <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {amenities.map((amenity, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-green-500" />
                                                <span>{amenity.Description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-4">Property Description</h2>
                                    <p className="text-gray-600">
                                        {hotelInfo.Description?.Text || "No description available"}
                                    </p>
                                </section>

                                {/* Room Details Section */}
                                {roomDetails.RoomDescription && (
                                    <section>
                                        <h2 className="text-xl font-semibold mb-4">Room Details</h2>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium mb-2">{roomDetails.RoomDescription.Name}</h3>
                                            <p className="text-gray-600">{roomDetails.RoomDescription.Text?.[0]}</p>
                                            
                                            {/* Bed Types */}
                                            {roomDetails.BedTypeOptions?.BedTypes?.map((bedType, idx) => (
                                                <div key={idx} className="mt-2">
                                                    {bedType.BedType.map((bed, i) => (
                                                        <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                                            {bed.Count}x {bed.Description}
                                                        </span>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Rate Plan Details */}
                                {ratePlan && (
                                    <section>
                                        <h2 className="text-xl font-semibold mb-4">Rate Information</h2>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                            {/* Meals Info */}
                                            {ratePlan.MealsIncluded?.Breakfast && (
                                                <div className="flex items-center text-green-600">
                                                    <Check className="w-5 h-5 mr-2" />
                                                    <span>Breakfast Included</span>
                                                </div>
                                            )}

                                            {/* Cancellation Policy */}
                                            {ratePlan.RateInfo?.CancelPenalties?.CancelPenalty?.[0] && (
                                                <div className="text-gray-700">
                                                    <h4 className="font-medium mb-1">Cancellation Policy</h4>
                                                    <p>{ratePlan.RateInfo.CancelPenalties.CancelPenalty[0].PenaltyDescription.Text}</p>
                                                </div>
                                            )}

                                            {/* Additional Details
                                            {ratePlan.RateInfo?.AdditionalDetails?.AdditionalDetail?.map((detail, idx) => (
                                                <div key={idx} className="text-gray-700">
                                                    <h4 className="font-medium mb-1">{detail.Description}</h4>
                                                    {detail.Text.map((text, i) => (
                                                        <p key={i} className="text-sm">{text}</p>
                                                    ))}
                                                </div>
                                            ))} */}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg p-6 shadow-md sticky top-32">
                            <div className="mb-4">
                                <p className="text-3xl font-bold text-blue-600">
                                    {lowestRate?.CurrencyCode} {lowestRate?.AverageNightlyRate}
                                </p>
                                <p className="text-gray-500">per night</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Base rate</span>
                                    <span>{lowestRate?.CurrencyCode} {lowestRate?.AverageNightlyRate}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Taxes & fees</span>
                                    <span>{lowestRate?.CurrencyCode} {(parseFloat(lowestRate?.AverageNightlyRate || "0") * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between p-2 font-bold">
                                    <span>Total</span>
                                    <span>{lowestRate?.CurrencyCode} {(parseFloat(lowestRate?.AverageNightlyRate || "0") * 1.1).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/hotel/process-payment', { 
                                    state: { 
                                        hotelDetails: hotel,
                                        rate: lowestRate
                                    }
                                })}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;