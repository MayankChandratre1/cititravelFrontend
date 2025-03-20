import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Home/Navbar';
import { CreditCard, MapPin, Users, ChevronRight } from 'lucide-react';
import CardDetailsForm from '../components/Checkout/CardDetailsForm';
import BillingAddressForm from '../components/Checkout/BillingAddressForm';
import GuestForm from '../components/Hotels/Checkout/GuestForm';
import { useCheckout } from '../context/CheckoutContext';

const HotelPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { hotelDetails, rate } = location.state || {};
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        billing: {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolderName: ''
        },
        address: {
            email: user?.email || '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phone: ''
        },
        guests: Array(hotelDetails?.roomCount || 1).fill({
            firstName: '',
            middleName: '',
            lastName: ''
        })
    });

    const { setCheckoutData } = useCheckout();

    if (!hotelDetails) {
        navigate('/hotel');
        return null;
    }

    const steps = [
        { id: 1, title: 'Card Details', icon: CreditCard },
        { id: 2, title: 'Billing Address', icon: MapPin },
        { id: 3, title: 'Guest Information', icon: Users }
    ];

    

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <CardDetailsForm formData={formData} setFormData={setFormData} />;
            case 2:
                return <BillingAddressForm formData={formData} setFormData={setFormData} />;
            case 3:
                return <GuestForm formData={formData} setFormData={setFormData} />;
            default:
                return null;
        }
    };

    const handleConfirmBooking = () => {
        if (currentStep === steps.length) {
            // Save all relevant data to context
            setCheckoutData({
                formData,
                hotelDetails,
                rate
            });
            navigate('/booking-confirmation');
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-blue-600 py-4 fixed inset-0 h-fit z-20">
                <Navbar highlight="white" activeTab="Hotel" />
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-44">
                {/* Booking Summary */}
                <div className="bg-gray-50 border rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium">{hotelDetails.HotelInfo.HotelName}</h3>
                            <p className="text-gray-600">{hotelDetails.HotelInfo.LocationInfo.Address.CityName.value}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                                {rate.CurrencyCode} {rate.AverageNightlyRate}
                            </p>
                            <p className="text-sm text-gray-500">per night</p>
                        </div>
                    </div>
                </div>

                {/* Checkout Steps */}
                <div className="flex justify-between mb-8">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center ${
                                step.id === currentStep 
                                    ? 'text-blue-600' 
                                    : step.id < currentStep 
                                        ? 'text-green-500' 
                                        : 'text-gray-400'
                            }`}>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 mr-2">
                                    <step.icon size={16} />
                                </div>
                                <span className="hidden sm:inline">{step.title}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <ChevronRight className="mx-4 text-gray-400" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mb-8">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                        disabled={currentStep === 1}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleConfirmBooking}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {currentStep === steps.length ? 'Confirm Booking' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelPayment;
