import React, { useState } from 'react';
import { useCheckout } from '../context/CheckoutContext';
import Navbar from '../components/Home/Navbar';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../api/api';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_51QwiF6RsjqJpXy6f0svgYic3ymED04Ol8VnSuc1Tyx97Sf99dme3UCNtT10vGxSgllBFrGiNvpwwEBd9mRomP6Fj00eGGqgKwz');

const CheckoutForm = ({ totalAmount, currency, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create a payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details:{
          
        }
      });

      if (error) {
        setError(error.message);
        onError(error);
        setProcessing(false);
        return;
      }
      console.log(paymentMethod);
      
      // Create payment intent
      // const createPaymentResponse = await axiosInstance.post('/api/v1/pay/create-payment-intent', {
      //   amount: Math.round(totalAmount * 100), // Convert to cents
      //   currency: currency.toLowerCase(),
      //   payment_method_id: paymentMethod.id,
      //   description: 'Flight Booking Payment'
      // });

      // if (!createPaymentResponse.data.success) {
      //   throw new Error('Failed to create payment intent');
      // }

      

      // // Confirm payment on backend
      // const confirmResponse = await axiosInstance.post('/api/v1/pay/confirm-payment', {
      //   paymentIntentId: createPaymentResponse.data.paymentIntentId
      // });

      // if (confirmResponse.data.success) {
      //   onSuccess({
      //     paymentIntentId: createPaymentResponse.data.paymentIntentId,
      //     status: confirmResponse.data.status
      //   });
      // } else {
      //   throw new Error('Payment confirmation failed');
      // }

    } catch (err) {
      setError(err.message || 'Payment failed');
      onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Card Details</label>
        <div className="border rounded-lg p-3 bg-white">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
            onChange={(e) => console.log(e)}
          />
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 rounded-lg text-white ${
          !stripe || processing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {processing ? 'Processing...' : `Pay ${currency} ${totalAmount}`}
      </button>
    </form>
  );
};

const PaymentConfirmation = () => {
    const { checkoutData, getTotalWithFees } = useCheckout();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);

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
            message: 'Payment completed successfully!',
            details: paymentDetails
        });
        
        // Here you can add logic to save the booking
        // For example:
        // try {
        //     await axiosInstance.post('/api/booking/create', {
        //         paymentIntentId: paymentDetails.paymentIntentId,
        //         ...checkoutData
        //     });
        //     navigate('/booking-confirmed');
        // } catch (error) {
        //     console.error('Failed to save booking:', error);
        // }
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentStatus({
            success: false,
            message: `Payment failed: ${error.message}`
        });
    };

    const handleDebugClick = () => {
        console.log('Complete Checkout Data:', checkoutData);
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
                    </div>

                    {/* Stripe Payment Form */}
                    <Elements stripe={stripePromise}>
                        <CheckoutForm 
                            totalAmount={totalAmount} 
                            currency={currency}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                            
                        />
                    </Elements>

                    {/* Debug Button - Remove in production */}
                    <button
                        onClick={handleDebugClick}
                        className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 text-sm"
                    >
                        Debug: Print Checkout Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;