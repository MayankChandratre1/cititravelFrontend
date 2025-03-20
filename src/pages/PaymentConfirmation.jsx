import React, { useState } from 'react';
import { useCheckout } from '../context/CheckoutContext';
import Navbar from '../components/Home/Navbar';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/Checkout/CheckoutForm'; // Import the modified CheckoutForm
import axiosInstance from '../api/api';
import { cardCodes } from '../lib/consts/cards';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_51QwiF6RsjqJpXy6f0svgYic3ymED04Ol8VnSuc1Tyx97Sf99dme3UCNtT10vGxSgllBFrGiNvpwwEBd9mRomP6Fj00eGGqgKwz');

const PaymentConfirmation = () => {
    const { checkoutData, getTotalWithFees } = useCheckout();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!checkoutData) {
        navigate('/flight');
        return null;
    }

    const SERVICE_FEE = 5; // Fixed $5 service fee
    const baseAmount = checkoutData.fare.totalFare.totalPrice;
    const totalAmount = (parseFloat(baseAmount) + SERVICE_FEE).toFixed(2);
    const currency = checkoutData.fare.totalFare.currency;

    const handlePaymentSuccess = async (paymentDetails) => {
        console.log('Payment successful:', paymentDetails);
        setPaymentStatus({
            success: true,
            message: 'Verifying your card...',
            details: paymentDetails
        });
        
        setLoading(true);
        
        try {
            // Get card details from PNR payload
            const cardDetails = checkoutData.pnrPayload.CreatePassengerNameRecordRQ.AirPrice[0]
                .PriceRequestInformation.OptionalQualifiers.FOP_Qualifiers.BasicFOP.CC_Info.PaymentCard;

                console.log('Card Details:', cardDetails);
                

            const verificationResponse = paymentDetails.last4 === cardDetails.Number.toString().slice(-4) 
            
            cardDetails.Code = cardCodes[paymentDetails.brand];
            checkoutData.pnrPayload.CreatePassengerNameRecordRQ.AirPrice[0]
                .PriceRequestInformation.OptionalQualifiers.FOP_Qualifiers.BasicFOP.CC_Info.PaymentCard.Code = cardDetails.Code;

                
            if (verificationResponse) {
                // If card verification successful, proceed with booking
                const bookingResponse = await axiosInstance.post('/api/v1/sabre/createpnr', checkoutData);
                
                if (bookingResponse.data.success) {
                    setPaymentStatus({
                        success: true,
                        message: `Booking confirmed! PNR: ${bookingResponse.data.pnr}`,
                        details: {
                            ...paymentDetails,
                            pnr: bookingResponse.data.pnr
                        }
                    });
                    
                    setTimeout(() => {
                        navigate('/account', { 
                            state: { 
                                pnr: bookingResponse.data.pnr,
                                paymentDetails: paymentDetails 
                            } 
                        });
                    }, 2000);
                } else {
                    throw new Error(bookingResponse.data.error || 'Failed to create booking');
                }
            } else {
                throw new Error('Card verification failed');
            }
        } catch (error) {
            console.error('Failed to create booking:', error);
            setPaymentStatus({
                success: false,
                message: `Payment failed: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentStatus({
            success: false,
            message: `Payment failed: ${error.message}`
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="bg-blue-600 py-4 fixed inset-0 h-fit z-20">
                <Navbar highlight="white" activeTab="Flight" />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-32">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">Payment Confirmation</h2>

                    {/* Status Message */}
                    {paymentStatus && (
                        <div className={`p-4 mb-6 rounded-lg ${
                            paymentStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {paymentStatus.message}
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between">
                            <span>Flight Fare:</span>
                            <span>{currency} {baseAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Service Fee:</span>
                            <span>{currency} {SERVICE_FEE.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-4 border-t">
                            <span>Total Amount:</span>
                            <span>{currency} {totalAmount}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                            Note: Only $5 will be charged initially to verify your card. The full amount will be charged at flight check-in.
                        </div>
                    </div>

                    {/* Stripe Payment Form */}
                    {!loading && !paymentStatus?.success && (
                        <Elements stripe={stripePromise}>
                            <CheckoutForm 
                                totalAmount={totalAmount} 
                                currency={currency}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </Elements>
                    )}

                    {loading && (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Processing...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;