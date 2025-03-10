import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FilterSection = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b pb-4">
        <button 
            onClick={onToggle}
            className="flex items-center justify-between w-full py-2"
        >
            <h3 className="font-semibold">{title}</h3>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isOpen && children}
    </div>
);

const FilterSidebar = ({ results, filters, setFilters }) => {
    const [openSections, setOpenSections] = useState({
        price: true,
        vendor: true,
        carType: true,
        mileage: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const {
        priceRange,
        vendors,
        carTypes,
        mileageRanges
    } = useMemo(() => {
        if (!results?.VehAvailInfos?.VehAvailInfo) {
            return {
                priceRange: [0, 1000],
                vendors: [],
                carTypes: [],
                mileageRanges: []
            };
        }

        const cars = results.VehAvailInfos.VehAvailInfo;
        const prices = cars.map(car => 
            parseFloat(car.VehRentalRate[0].VehicleCharges.VehicleCharge[0].Amount)
        );

        // Remove duplicates using Map to keep unique vendor entries
        const uniqueVendors = Array.from(
            new Map(cars.map(car => [
                car.Vendor.Code,
                {
                    code: car.Vendor.Code,
                    name: car.Vendor.Name
                }
            ])).values()
        );

        // Remove duplicates using Map to keep unique car type entries
        const uniqueCarTypes = Array.from(
            new Map(cars.map(car => [
                car.VehRentalRate[0].Vehicle.VehType,
                {
                    code: car.VehRentalRate[0].Vehicle.VehType,
                    name: car.VehRentalRate[0].Vehicle.VehMakeAndModel.split(' ')[0]
                }
            ])).values()
        );

        const uniqueMileages = [...new Set(cars.map(car => 
            parseInt(car.VehRentalRate[0].VehicleCharges.VehicleCharge[0].MileageAllowance)
        ))].sort((a, b) => a - b);

        return {
            priceRange: [Math.min(...prices), Math.max(...prices)],
            vendors: uniqueVendors,
            carTypes: uniqueCarTypes,
            mileageRanges: uniqueMileages
        };
    }, [results]);

    const handleResetFilters = () => {
        setFilters({
            priceRange: priceRange,
            carTypes: [],
            vendors: [],
            mileage: null
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg space-y-4 sticky top-32">
            <h2 className="text-xl font-bold mb-4">Filters</h2>

            {/* Price Range Filter */}
            <FilterSection 
                title="Price Range" 
                isOpen={openSections.price}
                onToggle={() => toggleSection('price')}
            >
                <div className="mt-4 px-2">
                    <div className="flex flex-col space-y-2">
                        <input
                            type="range"
                            min={priceRange[0]}
                            max={priceRange[1]}
                            value={filters.priceRange[1]}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                priceRange: [priceRange[0], parseInt(e.target.value)]
                            }))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm">
                            <span>${Math.round(priceRange[0])}</span>
                            <span>${Math.round(filters.priceRange[1])}</span>
                        </div>
                    </div>
                </div>
            </FilterSection>

            {/* Car Type Filter */}
            <FilterSection 
                title="Car Type" 
                isOpen={openSections.carType}
                onToggle={() => toggleSection('carType')}
            >
                <div className="space-y-2 mt-2">
                    {[...new Set(carTypes)].map(type => (
                        <label key={type.code} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.carTypes?.includes(type.code)}
                                onChange={(e) => {
                                    const newTypes = e.target.checked
                                        ? [...(filters.carTypes || []), type.code]
                                        : filters.carTypes?.filter(t => t !== type.code);
                                    setFilters(prev => ({ ...prev, carTypes: newTypes }));
                                }}
                                className="rounded border-gray-300"
                            />
                            <span>{type.name} ({type.code})</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Vendor Filter */}
            <FilterSection 
                title="Vendor" 
                isOpen={openSections.vendor}
                onToggle={() => toggleSection('vendor')}
            >
                <div className="space-y-2 mt-2">
                    {[...new Set(vendors)].map(vendor => (
                        <label key={vendor.code} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.vendors?.includes(vendor.code)}
                                onChange={(e) => {
                                    const newVendors = e.target.checked
                                        ? [...(filters.vendors || []), vendor.code]
                                        : filters.vendors?.filter(v => v !== vendor.code);
                                    setFilters(prev => ({ ...prev, vendors: newVendors }));
                                }}
                                className="rounded border-gray-300"
                            />
                            <span>{vendor.name}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Mileage Filter */}
            <FilterSection 
                title="Mileage Allowance" 
                isOpen={openSections.mileage}
                onToggle={() => toggleSection('mileage')}
            >
                <div className="space-y-2 mt-2">
                    <select
                        value={filters.mileage || ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            mileage: e.target.value ? parseInt(e.target.value) : null
                        }))}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Any mileage</option>
                        {mileageRanges.map(mileage => (
                            <option key={mileage} value={mileage}>
                                {mileage}+ miles included
                            </option>
                        ))}
                    </select>
                </div>
            </FilterSection>

            {/* Reset Filters Button */}
            <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
                Reset Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
