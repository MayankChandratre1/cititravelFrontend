import React from 'react';
import { X, Users, Briefcase, Car, DollarSign, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CarDetailsModal = ({ car, onClose }) => {
    const navigate = useNavigate();
    const vehicle = car.VehRentalRate[0].Vehicle;
    const charges = car.VehRentalRate[0].VehicleCharges.VehicleCharge.find(
        charge => charge.ChargeType === "BaseRateTotal"
    ) || car.VehRentalRate[0].VehicleCharges.VehicleCharge[0];

    const handleBooking = () => {
        navigate('/checkout', { 
            state: { 
                carBooking: true,
                carDetails: car 
            } 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
                {/* Background overlay */}
                <div className="fixed inset-0" onClick={onClose}></div>

                {/* Modal container */}
                <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Car images */}
                    <div className="h-[300px] md:h-[400px] w-full relative bg-gray-200">
                        <img
                            src={vehicle.Images.Image[0].Url}
                            alt={vehicle.VehMakeAndModel}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/800x400?text=Car+Image";
                            }}
                        />
                    </div>

                    {/* Content container */}
                    <div className="p-6 md:p-8">
                        {/* Header section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{vehicle.VehMakeAndModel}</h2>
                                    <p className="text-gray-600">Type: {vehicle.VehType}</p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <span className="flex items-center gap-2">
                                            <Users className="text-gray-400" size={20} />
                                            {vehicle.SeatBeltsAndBagsInfo?.SeatBelts?.Quantity || 4} Seats
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Briefcase className="text-gray-400" size={20} />
                                            {(vehicle.SeatBeltsAndBagsInfo?.BagsInfo?.Bags || [])
                                                .reduce((acc, bag) => acc + (bag.Quantity || 0), 0)} Bags
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {charges.CurrencyCode} {charges.Amount}
                                    </p>
                                    <p className="text-gray-500">per day</p>
                                </div>
                            </div>
                        </div>

                        {/* Main content grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left column - Rental Details */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Rental Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Check className="text-green-500" size={20} />
                                        <span>Mileage: {charges.MileageAllowance} {charges.UOM} included</span>
                                    </div>
                                    {charges.ExtraMileageCharge && (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="text-blue-500" size={20} />
                                            <span>Extra mileage: {charges.CurrencyCode} {charges.ExtraMileageCharge}/{charges.UOM}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right column - Vendor Info */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Vendor Information</h3>
                                <div className="space-y-4">
                                    <img 
                                        src={car.Vendor.Logo} 
                                        alt={car.Vendor.Name}
                                        className="h-12 object-contain"
                                    />
                                    <p className="text-lg font-medium">{car.Vendor.Name}</p>
                                    {car.PickUpLocation && (
                                        <div className="text-gray-600">
                                            <p>Pickup Location: {car.PickUpLocation.LocationCode}</p>
                                            <p>Return Location: {car.ReturnLocation.LocationCode}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 text-center"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleBooking}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1 text-center"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetailsModal;
