import React from 'react';
import { CreditCard } from 'lucide-react';

const CardDetailsForm = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            billing: {
                ...prev.billing,
                [e.target.name]: e.target.value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Payment Details</h3>
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={formData.billing.cardNumber}
                        onChange={handleChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        maxLength="19"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={formData.billing.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            maxLength="5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CVV</label>
                        <input
                            type="text"
                            name="cvv"
                            value={formData.billing.cvv}
                            onChange={handleChange}
                            placeholder="XXX"
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            maxLength="4"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                    <input
                        type="text"
                        name="cardHolderName"
                        value={formData.billing.cardHolderName}
                        onChange={handleChange}
                        placeholder="NAME ON CARD"
                        className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    )
};

export default CardDetailsForm;