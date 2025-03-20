// In your CheckoutForm component
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import axiosInstance from '../../api/api';

const CheckoutForm = ({ totalAmount, currency, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create a payment method using the card element
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
      
      if (error) {
        throw error;
      }
      
      // Send the payment method ID to your server
      const response = await axiosInstance.post('/api/v1/pay/create-verification', {
        amount: 5, // Only charge $5 for verification
        currency: currency,
        paymentMethodId: paymentMethod.id
      });
      
      if (response.data.success) {
        // Handle success
        if (response.data.status === 'requires_action') {
          // Handle 3D Secure authentication if needed
          const { error, paymentIntent } = await stripe.confirmCardPayment(
            response.data.clientSecret
          );
          
          if (error) {
            throw error;
          } else if (paymentIntent.status === 'succeeded') {
            onSuccess({
              last4: response.data.last4,
              brand: response.data.brand,
              paymentMethodId: response.data.paymentMethodId
            });
          }
        } else {
          onSuccess({
            last4: response.data.last4,
            brand: response.data.brand,
            paymentMethodId: response.data.paymentMethodId
          });
        }
      } else {
        throw new Error(response.data.error || 'Payment verification failed');
      }
    } catch (error) {
      setErrorMessage(error.message);
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Card Details</label>
        <div className="p-3 border rounded-md">
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
          }} />
        </div>
      </div>
      
      {errorMessage && (
        <div className="text-red-500 mb-4">{errorMessage}</div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CheckoutForm;