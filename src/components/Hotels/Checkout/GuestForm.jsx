import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const GuestForm = ({ formData, setFormData }) => {
    const [expandedGuest, setExpandedGuest] = React.useState(0);

    const handleGuestChange = (index, field, value) => {
        const newGuests = [...formData.guests];
        newGuests[index] = {
            ...newGuests[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            guests: newGuests
        }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Guest Information</h3>
            <div className="space-y-4">
                {formData.guests.map((guest, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedGuest(expandedGuest === idx ? -1 : idx)}
                            className="w-full flex justify-between items-center p-4 bg-gray-50"
                        >
                            <span className="font-medium">Guest {idx + 1}</span>
                            {expandedGuest === idx ? <ChevronUp /> : <ChevronDown />}
                        </button>

                        {expandedGuest === idx && (
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            First Name *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={guest.firstName}
                                            onChange={(e) => handleGuestChange(idx, 'firstName', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            value={guest.middleName}
                                            onChange={(e) => handleGuestChange(idx, 'middleName', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Last Name *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={guest.lastName}
                                            onChange={(e) => handleGuestChange(idx, 'lastName', e.target.value)}
                                            className="mt-1 block w-full p-2 rounded-md border border-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GuestForm;
