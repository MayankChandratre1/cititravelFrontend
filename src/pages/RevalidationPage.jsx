import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFlightSearch from '../hooks/useFlightSearch';
import { Plane, Clock, Calendar, CreditCard, Plus, Minus } from 'lucide-react';
import "../styles/airline_logo.css";
import { airlines } from '../lib/consts/airlines';
import useFlights from '../hooks/useFlights';
import Navbar from '../components/Home/Navbar';

const RevalidationPage = () => {
    const navigate = useNavigate();
    const { revalidationResults } = useFlightSearch();
    const {cities} = useFlights()
    const [activeItineraryIndex, setActiveItineraryIndex] = useState(0);
    const [extraBaggage, setExtraBaggage] = useState({
        amount: 0,
        price: 20
    });
    const { isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        if (!revalidationResults) {
            navigate('/random');
        }
    }, [revalidationResults, navigate]);

    if (!revalidationResults) {
        return <div className="flex justify-center items-center min-h-screen">
            <p className="text-lg text-gray-600">No revalidation data available</p>
        </div>;
    }

    const getScheduleById = (id) => {
        return revalidationResults.groupedItineraryResponse.scheduleDescs.find(
            schedule => schedule.id === id
        );
    };

    const formatTime = (time) => {
        return new Date(`2025-02-21T${time.split('+')[0]}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTaxDetails = (taxRefs) => {
        return taxRefs.map(ref => 
            revalidationResults.groupedItineraryResponse.taxDescs.find(tax => tax.id === ref.ref)
        ).filter(Boolean);
    };

    const calculateExtraBaggageCost = () => {
        console.log(extraBaggage);
        
        return extraBaggage.amount * extraBaggage.price;
    };

    const getBaggageAllowance = (baggageInfo) => {
        if (!baggageInfo) return null;
        const allowance = revalidationResults.groupedItineraryResponse.baggageAllowanceDescs
            .find(b => b.id === baggageInfo[0]?.allowance?.ref);
        return allowance;
    };

    const handleCheckout = () => {
        if (isAuthenticated()) {
            navigate('/checkout');
        } else {
            setShowLoginModal(true);
        }
    };

    const handleLoginRedirect = () => {
        // Create a URL-safe state parameter with current itinerary info
        const redirectState = encodeURIComponent(JSON.stringify({
            page: 'revalidation',
            itineraryId: currentItinerary.id,
            extraBaggage
        }));
        navigate(`/login?redirectUrl=${redirectState}`);
    };

    // Add Login Modal Component
    const LoginPromptModal = () => {
        if (!showLoginModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 className="text-xl font-semibold mb-4">Login Required</h3>
                    <p className="text-gray-600 mb-6">
                        Please log in to continue with your booking. You'll be redirected back here after logging in.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLoginRedirect}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const itineraries = revalidationResults.groupedItineraryResponse.itineraryGroups[0].itineraries;
    const currentItinerary = itineraries[activeItineraryIndex];
    const fare = currentItinerary.pricingInformation[0].fare;

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-2 sm:px-4 lg:px-8">
             <div className='bg-blue-600 py-4 fixed  inset-0 w-full h-fit'>
            <Navbar highlight={"white"} activeTab={"Flight"} />
        </div>
            <div className="max-w-7xl mx-auto pt-32">
                {/* Itinerary Selector */}
                {itineraries.length > 1 && (
                    <div className="mb-6 flex flex-wrap gap-3">
                        {itineraries.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveItineraryIndex(idx)}
                                className={`px-6 py-3 text-lg rounded-lg shadow-sm transition-colors ${
                                    activeItineraryIndex === idx 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                Option {idx + 1}
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-blue-700">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">Flight Details</h1>
                                <div className="text-right">
                                    <p className="text-3xl sm:text-4xl font-bold text-white">
                                        {fare.totalFare.currency} {fare.totalFare.totalPrice}
                                    </p>
                                    <p className="text-blue-100">Total Price</p>
                                </div>
                            </div>
                        </div>

                        {/* Flight Segments */}
                        <div className="p-4 sm:p-8">
                            {currentItinerary.legs.map((leg, legIndex) => {
                                const legDesc = revalidationResults.groupedItineraryResponse.legDescs.find(
                                    desc => desc.id === leg.ref
                                );

                                
                                
                                return (
                                    <div key={legIndex} className={`${legIndex > 0 ? 'mt-8 pt-8 border-t-2' : ''}`}>
                                        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
                                            Flight {legIndex + 1}
                                        </h2>
                                        
                                        {legDesc.schedules.map((schedule, idx) => {
                                            const flight = getScheduleById(schedule.ref);
                                            const airlineName = airlines.find(a => a.code === flight.carrier.marketing)?.name;
                                            const departureAirport = cities.find(city => city.code === flight.departure.airport);
                            const arrivalAirport = cities.find(city => city.code === flight.arrival.airport);

                                            return (
                                                <div key={idx} className={`${idx > 0 ? 'mt-6' : ''} bg-gray-50 rounded-xl p-6`}>
                                                    {/* Airline Info */}
                                                    <div className="flex items-center gap-6 mb-6">
                                                        <div className={`w-24 h-24 sm:w-32 sm:h-32 i-airline i-airline-${flight.carrier.marketing.toLowerCase()}`} />
                                                        <div>
                                                            <p className="text-xl sm:text-2xl font-bold text-gray-800">{airlineName}</p>
                                                            <p className="text-lg text-gray-600">
                                                                Flight {flight.carrier.marketingFlightNumber}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Flight Details */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                                                        {/* Departure */}
                                                        <div className="text-center sm:text-left">
                                                            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                                                                {formatTime(flight.departure.time)}
                                                            </p>
                                                            <p className="text-lg sm:text-xl font-medium text-gray-700">
                                                                {departureAirport?.name}
                                                            </p>
                                                            <p className="text-gray-600">
                                                                Terminal {flight.departure.terminal}
                                                            </p>
                                                        </div>

                                                        {/* Duration */}
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-lg text-gray-600 mb-2">
                                                                {formatDuration(flight.elapsedTime)}
                                                            </p>
                                                            <div className="w-full flex items-center gap-2">
                                                                <div className="h-1 flex-1 bg-gray-300"></div>
                                                                <Plane className="text-blue-600 transform rotate-90" />
                                                                <div className="h-1 flex-1 bg-gray-300"></div>
                                                            </div>
                                                            {idx < legDesc.schedules.length - 1 && (
                                                                <p className="mt-2 text-orange-600 font-medium">Layover</p>
                                                            )}
                                                        </div>

                                                        {/* Arrival */}
                                                        <div className="text-center sm:text-right">
                                                            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                                                                {formatTime(flight.arrival.time)}
                                                            </p>
                                                            <p className="text-lg sm:text-xl font-medium text-gray-700">
                                                                {arrivalAirport?.name}
                                                            </p>
                                                            <p className="text-gray-600">
                                                                Terminal {flight.arrival.terminal}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Baggage and Price Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Baggage Section */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Baggage Details</h3>
                            {currentItinerary.legs.map((leg, idx) => {
                                const baggageInfo = fare.passengerInfoList[0].passengerInfo.baggageInformation;
                                const allowance = getBaggageAllowance(baggageInfo);
                                const isInPieces = allowance?.pieceCount >= 0;
                                const incr = isInPieces ? 1 : 5;
                                const isExtraBaggage = !!fare.ancillaryFeeGroup?.ancillaryFees
                                const extraBaggageFeeDetails = isExtraBaggage ? fare.ancillaryFeeGroup?.ancillaryFees.find(fee => fee.code === 'BG'): null;
                                const extraBaggageFee = isExtraBaggage ? extraBaggageFeeDetails?.details[0].amount: 0;
                                
                                
                            
                            
                                return (
                                    <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">Flight {idx + 1}</p>
                                                <p>Included Baggage: {`${allowance?.weight ? `${allowance?.weight} ${allowance?.unit}`:`${allowance?.pieceCount} Piece`}`}</p>
                                                <p>Extra Fees: {extraBaggageFee}</p>
                                            </div>
                                            {
                                                isExtraBaggage && <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => setExtraBaggage({
                                                        amount: Math.max(0, extraBaggage.amount - incr),
                                                        price: extraBaggageFee
                                                    })}
                                                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span>Extra: {extraBaggage.amount} {`${isInPieces ? "Pieces":"Kg"}`}</span>
                                                <button 
                                                    onClick={() => setExtraBaggage({
                                                        amount: extraBaggage.amount + incr,
                                                        price: extraBaggageFee
                                                    })}
                                                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Price Breakdown */}
                        <div className="border-t p-6 bg-gray-50 border-gray-200 rounded-lg shadow-lg">
                            <h3 className="font-semibold mb-4">Price Details</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Base Fare</span>
                                    <span><span className='text-xs'>{fare.totalFare.currency}</span> {fare.totalFare.equivalentAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes & Fees</span>
                                    <span><span className='text-xs'>{fare.totalFare.currency}</span> {fare.totalFare.totalTaxAmount}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span>{fare.totalFare.currency} {fare.totalFare.totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Fare Breakdown */}
                        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
                            <h3 className="text-xl font-semibold mb-4">Fare Breakdown</h3>
                            <div className="space-y-4">
                                {/* Base Fare */}
                                <div className="flex justify-between border-b pb-2">
                                    <span>Base Fare</span>
                                    <span>{fare.totalFare.baseFareCurrency} {fare.totalFare.baseFareAmount}</span>
                                </div>

                                {/* Taxes and Fees */}
                                <div className="space-y-2">
                                    <p className="font-semibold">Taxes & Fees</p>
                                    {getTaxDetails(fare.passengerInfoList[0].passengerInfo.taxes).map((tax, idx) => (
                                        <div key={idx} className="flex justify-between gap-2 text-sm">
                                            <span>{tax.description}</span>
                                            <span>{tax.amount}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Extra Baggage Cost if any */}
                                {extraBaggage.amount > 0 && (
                                    <div className="flex justify-between border-t pt-2">
                                        <span>Extra Baggage ({extraBaggage.amount})</span>
                                        <span>USD {calculateExtraBaggageCost()}</span>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <span>Grand Total</span>
                                    <span>{fare.totalFare.currency} {(parseFloat(fare.totalFare.totalPrice) + calculateExtraBaggageCost()).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                        <button 
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 text-lg border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={handleCheckout}
                            className="px-8 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-6 h-6" />
                            Proceed to Payment
                        </button>
                    </div>

                    {/* Login Modal */}
                    <LoginPromptModal />
                </div>
            </div>
        </div>
    );
};

const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

export default RevalidationPage;