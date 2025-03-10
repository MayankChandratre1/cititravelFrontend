import React, { createContext, useContext, useState, useEffect } from 'react';

const CheckoutContext = createContext(null);

export const CheckoutProvider = ({ children }) => {
    const [checkoutData, setCheckoutData] = useState(() => {
        const savedData = sessionStorage.getItem('checkoutData');
        return savedData ? JSON.parse(savedData) : null;
    });

    // Stripe charges 2.9% + $0.30 per transaction
    const calculateStripeFee = (amount) => {
        return ((amount * 0.030) + 0.30).toFixed(2);
    };

    const getTotalWithFees = (amount) => {
        return (parseFloat(amount) + parseFloat(calculateStripeFee(amount))).toFixed(2);
    };

    useEffect(() => {
        if (checkoutData) {
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        }
    }, [checkoutData]);

    const clearCheckoutData = () => {
        setCheckoutData(null);
        sessionStorage.removeItem('checkoutData');
    };

    return (
        <CheckoutContext.Provider value={{ 
            checkoutData, 
            setCheckoutData, 
            clearCheckoutData,
            calculateStripeFee,
            getTotalWithFees
        }}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};

export default CheckoutContext;
