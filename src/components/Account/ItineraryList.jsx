import React, { useState } from 'react';
import { MapPin, Calendar, Users, DollarSign, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import axiosInstance from '../../api/api';

const ItineraryList = ({ itineraries }) => {
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [showPassportModal, setShowPassportModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'text-green-600 bg-green-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle className="w-5 h-5" />;
            case 'failed':
                return <XCircle className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    const handlePassportUpdate = async (itineraryId, passportData) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/v1/user/updateIntinarary', {
                itineraryId,
                data: passportData,
                pnr: selectedItinerary.pnr
            });

            if (response.data.success) {
                setShowPassportModal(false);
                // You might want to refresh the itineraries here
            }
        } catch (error) {
            console.error('Error updating passport details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Only show confirmed bookings
    const confirmedItineraries = itineraries.filter(it => it.status.toLowerCase() === 'confirmed');

    return (
        <div className="space-y-4">
            {confirmedItineraries.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No confirmed itineraries found</p>
            ) : (
                confirmedItineraries.map((itinerary) => (
                    <div key={itinerary._id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                        {/* Header with Status */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div className="w-full sm:w-auto">
                                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                                    {itinerary.itineraryDetails.map((leg, idx) => (
                                        <React.Fragment key={leg._id}>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{leg.departureLocation}</span>
                                                <span className="text-xs sm:text-sm text-gray-500">Departure</span>
                                            </div>
                                            <span className="text-gray-400">→</span>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{leg.arrivalLocation}</span>
                                                <span className="text-xs sm:text-sm text-gray-500">Arrival</span>
                                            </div>
                                            {idx < itinerary.itineraryDetails.length - 1 && (
                                                <span className="mx-2">|</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Booking Date: {formatDate(itinerary.bookingDate)}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedItinerary(itinerary);
                                    setShowPassportModal(true);
                                }}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                            >
                                <Package size={16} />
                                <span className="text-sm">Update Passport Details</span>
                            </button>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Travel Details */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(itinerary.itineraryDetails[0].departureDate)}</span>
                                </div>
                                {itinerary.pnr && (
                                    <div className="text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                                        PNR: {itinerary.pnr}
                                    </div>
                                )}
                            </div>

                            {/* Passenger Details */}
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Users className="w-4 h-4" />
                                    <span>{itinerary.passengers.length} Passenger(s)</span>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {itinerary.passengers[0].firstName} {itinerary.passengers[0].lastName}
                                    {itinerary.passengers.length > 1 && ` +${itinerary.passengers.length - 1} more`}
                                </div>
                            </div>

                            {/* Price Details */}
                            <div className="text-right col-span-1 sm:col-span-2 lg:col-span-1">
                                <div className="text-lg sm:text-xl font-bold text-blue-600">
                                    {itinerary.currency} {itinerary.totalAmount}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {itinerary.paymentStatus}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Passport Details Modal */}
            {showPassportModal && selectedItinerary && (
                <PassportDetailsModal
                    itinerary={selectedItinerary}
                    onClose={() => {
                        setShowPassportModal(false);
                        setSelectedItinerary(null);
                    }}
                    onSubmit={handlePassportUpdate}
                    loading={loading}
                />
            )}
        </div>
    );
};

const PassportDetailsModal = ({ itinerary, onClose, onSubmit, loading }) => {
    const [passportData, setPassportData] = useState(
        itinerary.passengers.map(p => ({
            passengerId: p._id,
            passportNumber: p.passportNumber || '',
            nationality: p.nationality || '',
            passportExpiry: p.passportExpiry ? new Date(p.passportExpiry).toISOString().split('T')[0] : ''
        }))
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(itinerary._id, passportData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-bold mb-4">Update Passport Details</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {passportData.map((passenger, idx) => (
                            <div key={passenger.passengerId} className="border-b pb-4">
                                <h4 className="font-medium mb-2 text-sm sm:text-base">
                                    Passenger {idx + 1}: {itinerary.passengers[idx].firstName} {itinerary.passengers[idx].lastName}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Passport Number</label>
                                        <input
                                            type="text"
                                            value={passenger.passportNumber}
                                            onChange={(e) => {
                                                const newData = [...passportData];
                                                newData[idx].passportNumber = e.target.value;
                                                setPassportData(newData);
                                            }}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nationality</label>
                                        <input
                                            type="text"
                                            value={passenger.nationality}
                                            onChange={(e) => {
                                                const newData = [...passportData];
                                                newData[idx].nationality = e.target.value;
                                                setPassportData(newData);
                                            }}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Passport Expiry</label>
                                        <input
                                            type="date"
                                            value={passenger.passportExpiry}
                                            onChange={(e) => {
                                                const newData = [...passportData];
                                                newData[idx].passportExpiry = e.target.value;
                                                setPassportData(newData);
                                            }}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Updating...' : 'Update Details'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItineraryList;
