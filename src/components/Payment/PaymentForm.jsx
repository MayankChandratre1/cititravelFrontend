import React, { useState } from 'react';
import { useCheckout } from '../context/CheckoutContext';
import Navbar from '../components/Home/Navbar';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_your_publishable_key_here');

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
      // Create a payment method using the card element
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        setError(error.message);
        onError(error);
        setProcessing(false);
        return;
      }

      // Here you would normally send the paymentMethod.id to your server
      // and complete the payment there using Stripe API
      
      // Simulate a backend request
      // In a real app, replace this with an actual fetch to your backend
      setTimeout(() => {
        onSuccess(paymentMethod);
        setProcessing(false);
      }, 1000);
      
    } catch (err) {
      setError('An unexpected error occurred.');
      onError(err);
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
          }}/>
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

    const baseAmount = checkoutData.fare.totalFare.totalPrice;
    const totalAmount = getTotalWithFees(baseAmount);
    const stripeFee = (totalAmount - baseAmount).toFixed(2);
    const currency = checkoutData.fare.totalFare.currency;

    const handlePaymentSuccess = (paymentMethod) => {
        console.log('Payment successful:', paymentMethod);
        setPaymentStatus({
            success: true,
            message: 'Payment completed successfully!'
        });
        
        // In a real app, you would redirect to a success page or show a success message
        // setTimeout(() => navigate('/booking-confirmed'), 2000);
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentStatus({
            success: false,
            message: 'Payment failed. Please try again.'
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
                            <span>Base Amount:</span>
                            <span>{currency} {baseAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Processing Fee:</span>
                            <span>{currency} {stripeFee}</span>
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