import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Briefcase, DollarSign } from 'lucide-react';
import CarDetailsModal from './CarDetailsModal';

const ITEMS_PER_PAGE = 5;

const CarList = ({ results, filters }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCar, setSelectedCar] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Add debug logging
    console.log("Car Results:", results);

    if (!results?.VehAvailInfos?.VehAvailInfo) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Search for available cars</p>
            </div>
        );
    }

    const filteredCars = results.VehAvailInfos.VehAvailInfo.filter(car => {
        const rate = parseFloat(car.VehRentalRate[0].VehicleCharges.VehicleCharge[0].Amount);
        const mileage = parseInt(car.VehRentalRate[0].VehicleCharges.VehicleCharge[0].MileageAllowance);
        const carType = car.VehRentalRate[0].Vehicle.VehType;
        const vendorCode = car.Vendor.Code;
        
        // Price filter
        if (rate < filters.priceRange[0] || rate > filters.priceRange[1]) {
            return false;
        }

        // Car type filter
        if (filters.carTypes && filters.carTypes.length > 0) {
            if (!filters.carTypes.includes(carType)) {
                return false;
            }
        }

        // Vendor filter
        if (filters.vendors && filters.vendors.length > 0) {
            if (!filters.vendors.includes(vendorCode)) {
                return false;
            }
        }

        // Mileage filter
        if (filters.mileage && mileage < filters.mileage) {
            return false;
        }

        return true;
    });

    const totalItems = filteredCars.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const currentCars = filteredCars.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleBooking = (car) => {
        navigate('/checkout', { 
            state: { 
                carBooking: true,
                carDetails: car 
            } 
        });
    };

    return (
        <div className="space-y-4">
            {/* Results count */}
            <p className="text-sm text-gray-600">
                Showing {Math.min(currentCars.length, ITEMS_PER_PAGE)} of {totalItems} cars available
            </p>

            {/* Car Cards */}
            {currentCars.map((car, idx) => {
                const vehicle = car.VehRentalRate[0].Vehicle;
                const charges = car.VehRentalRate[0].VehicleCharges.VehicleCharge.find(
                    charge => charge.ChargeType === "BaseRateTotal"
                ) || car.VehRentalRate[0].VehicleCharges.VehicleCharge[0];

                return (
                    <div key={`${car.Vendor.Code}-${idx}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Car Image */}
                            <div className="md:w-1/3 h-48 md:h-auto">
                                <img
                                    src={vehicle.Images.Image[0].Url}
                                    alt={vehicle.VehMakeAndModel}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/400x300?text=Car+Image";
                                    }}
                                />
                            </div>

                            {/* Car Details */}
                            <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{vehicle.VehMakeAndModel}</h3>
                                            <p className="text-gray-600">{vehicle.VehType}</p>
                                        </div>
                                        <img 
                                            src={car.Vendor.Logo} 
                                            alt={car.Vendor.Name}
                                            className="h-8 object-contain"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/120x40?text=Vendor+Logo";
                                            }}
                                        />
                                    </div>

                                    {/* Features */}
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="text-gray-400" size={20} />
                                            <span>{vehicle.SeatBeltsAndBagsInfo?.SeatBelts?.Quantity || 4} Seats</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="text-gray-400" size={20} />
                                            <span>
                                                {(vehicle.SeatBeltsAndBagsInfo?.BagsInfo?.Bags || [])
                                                    .reduce((acc, bag) => acc + (bag.Quantity || 0), 0)} Bags
                                            </span>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>Mileage: {charges.MileageAllowance} {charges.UOM} included</p>
                                        {charges.ExtraMileageCharge && (
                                            <p>Extra mileage: {charges.CurrencyCode} {charges.ExtraMileageCharge}/{charges.UOM}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {charges.CurrencyCode} {charges.Amount}
                                        </p>
                                        <p className="text-sm text-gray-500">per day</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedCar(car);
                                            setShowModal(true);
                                        }}
                                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Details Modal */}
            {showModal && selectedCar && (
                <CarDetailsModal
                    car={selectedCar}
                    onClose={() => {
                        setSelectedCar(null);
                        setShowModal(false);
                    }}
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded ${
                                currentPage === i + 1
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CarList;
