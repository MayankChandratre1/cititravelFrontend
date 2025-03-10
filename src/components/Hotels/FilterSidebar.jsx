import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

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
        starRating: true,
        amenities: true,
        propertyType: true,
        guestRating: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Custom Range Input component
    const PriceRangeInput = ({ value, min, max, onChange }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>${value[0]}</span>
                <span>${value[1]}</span>
            </div>
            <div className="flex gap-4">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value[0]}
                    onChange={(e) => onChange([parseInt(e.target.value), value[1]])}
                    className="w-full"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value[1]}
                    onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
                    className="w-full"
                />
            </div>
        </div>
    );

    // Extract filter data from results
    const { priceRange, amenitiesList, propertyTypes, ratings } = React.useMemo(() => {
        if (!results?.GetHotelAvailRS?.HotelAvailInfos?.HotelAvailInfo) {
            return {
                priceRange: [0, 10000],
                amenitiesList: [],
                propertyTypes: [],
                ratings: []
            };
        }

        const hotels = results.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo;
        const rates = hotels.map(hotel => 
            hotel.HotelRateInfo.RateInfos?.ConvertedRateInfo?.[0]?.AverageNightlyRate || 0
        );

        const amenities = new Set();
        const types = new Set();
        const allRatings = new Set();

        hotels.forEach(hotel => {
            // Collect amenities
            hotel.HotelInfo.Amenities?.Amenity?.forEach(amenity => {
                amenities.add({ code: amenity.Code, description: amenity.Description });
            });

            // Collect property types
            hotel.HotelInfo.PropertyTypeInfo?.PropertyType?.forEach(type => {
                types.add({ code: type.Code, description: type.Description });
            });

            // Collect ratings
            if (hotel.HotelInfo.SabreRating !== "NA") {
                allRatings.add(Math.floor(Number(hotel.HotelInfo.SabreRating)));
            }
        });

        return {
            priceRange: [Math.min(...rates), Math.max(...rates)],
            amenitiesList: Array.from(amenities),
            propertyTypes: Array.from(types),
            ratings: Array.from(allRatings).sort((a, b) => b - a)
        };
    }, [results]);

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
                    <PriceRangeInput
                        value={filters.priceRange}
                        min={0}
                        max={1000}
                        onChange={(newValue) => setFilters(prev => ({
                            ...prev,
                            priceRange: newValue
                        }))}
                    />
                </div>
            </FilterSection>

            {/* Star Rating Filter */}
            <FilterSection 
                title="Star Rating" 
                isOpen={openSections.starRating}
                onToggle={() => toggleSection('starRating')}
            >
                <div className="mt-2 space-y-2">
                    {ratings.map(stars => (
                        <label key={stars} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.starRating.includes(stars)}
                                onChange={(e) => {
                                    const newRatings = e.target.checked 
                                        ? [...filters.starRating, stars]
                                        : filters.starRating.filter(r => r !== stars);
                                    setFilters(prev => ({
                                        ...prev,
                                        starRating: newRatings
                                    }));
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <div className="flex">
                                {[...Array(stars)].map((_, i) => (
                                    <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                                ))}
                            </div>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Amenities Filter */}
            <FilterSection 
                title="Amenities" 
                isOpen={openSections.amenities}
                onToggle={() => toggleSection('amenities')}
            >
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {amenitiesList.map(amenity => (
                        <label key={amenity.code} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity.code)}
                                onChange={(e) => {
                                    const newAmenities = e.target.checked 
                                        ? [...filters.amenities, amenity.code]
                                        : filters.amenities.filter(a => a !== amenity.code);
                                    setFilters(prev => ({
                                        ...prev,
                                        amenities: newAmenities
                                    }));
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span>{amenity.description}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Property Type Filter */}
            <FilterSection 
                title="Property Type" 
                isOpen={openSections.propertyType}
                onToggle={() => toggleSection('propertyType')}
            >
                <div className="mt-2 space-y-2">
                    {propertyTypes.map(type => (
                        <label key={type.code} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.propertyTypes.includes(type.code)}
                                onChange={(e) => {
                                    const newTypes = e.target.checked 
                                        ? [...filters.propertyTypes, type.code]
                                        : filters.propertyTypes.filter(t => t !== type.code);
                                    setFilters(prev => ({
                                        ...prev,
                                        propertyTypes: newTypes
                                    }));
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span>{type.description}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Distance Filter */}
            <FilterSection 
                title="Distance" 
                isOpen={openSections.distance}
                onToggle={() => toggleSection('distance')}
            >
                <div className="mt-2">
                    <select
                        value={filters.distance}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            distance: e.target.value
                        }))}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="any">Any Distance</option>
                        <option value="0-1">Less than 1 mile</option>
                        <option value="1-3">1-3 miles</option>
                        <option value="3-5">3-5 miles</option>
                        <option value="5-10">5-10 miles</option>
                        <option value="10-100">10+ miles</option>
                    </select>
                </div>
            </FilterSection>

            {/* Reset Button */}
            <button
                onClick={() => setFilters({
                    priceRange: priceRange,
                    starRating: [],
                    amenities: [],
                    propertyTypes: [],
                    distance: 'any'
                })}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
                Reset Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
