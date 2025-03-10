import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PassengerForm = ({ formData, setFormData, searchParams }) => {
    const [expandedPassenger, setExpandedPassenger] = useState(0);

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...formData.passengers];
        newPassengers[index] = {
            ...newPassengers[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            passengers: newPassengers
        }));
    };

    const getPassengerType = (index) => {
        let count = 0;
        for (const passenger of searchParams.PassengerTypeQuantity) {
            if (index < count + passenger.Quantity) {
                return passenger.Code;
            }
            count += passenger.Quantity;
        }
        return 'ADULT';
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Passenger Information</h3>
            <div className="space-y-4">
                {formData.passengers.map((passenger, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPassenger(expandedPassenger === idx ? -1 : idx)}
                            className="w-full flex justify-between items-center p-4 bg-gray-200"
                        >
                            <span className="font-medium">
                                Passenger {idx + 1} ({getPassengerType(idx)})
                            </span>
                            {expandedPassenger === idx ? <ChevronUp /> : <ChevronDown />}
                        </button>

                        {expandedPassenger === idx && (
                            <div className="p-4 space-y-4">
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 required">
                                            First Name *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={passenger.firstName}
                                            onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-black/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            value={passenger.middleName}
                                            onChange={(e) => handlePassengerChange(idx, 'middleName', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-black/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 required">
                                            Last Name *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={passenger.lastName}
                                            onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-black/50"
                                        />
                                    </div>
                                </div>

                                {/* Personal Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 required">
                                            Date of Birth *
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            value={passenger.dob}
                                            onChange={(e) => handlePassengerChange(idx, 'dob', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-black/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 required">
                                            Gender *
                                        </label>
                                        <select
                                            required
                                            value={passenger.gender}
                                            onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-black/50"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .required:after {
                    content: " *";
                    color: red;
                }
            `}</style>
        </div>
    );
};

export default PassengerForm;
