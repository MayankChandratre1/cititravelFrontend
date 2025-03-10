import React from 'react';
import { useAuth } from '../../context/AuthContext';

const BillingAddressForm = ({ formData, setFormData }) => {
    const { user } = useAuth();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [e.target.name]: e.target.value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Billing Address</h3>
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="mt-1 block w-full p-2 border rounded-md border-black/50 bg-gray-50 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md border-black/50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.address.city}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border rounded-md border-black/50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.address.state}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border rounded-md border-black/50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                            type="text"
                            name="zipCode"
                            value={formData.address.zipCode}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border rounded-md border-black/50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.address.country}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border rounded-md border-black/50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.address.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md border-black/50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default BillingAddressForm;
