import React, { useState, useEffect } from 'react';
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

const FilterSidebar = ({ searchResults, filters, setFilters }) => {
    const [openSections, setOpenSections] = useState({
        baggage: true,
        airlines: true,
        price: true,
        duration: true,
        stops: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Extract min/max prices and durations from search results
    const { priceRange, durationRange, availableAirlines } = React.useMemo(() => {
        if (!searchResults?.groupedItineraryResponse?.itineraryGroups[0]?.itineraries) {
            return { priceRange: [0, 1000], durationRange: [0, 24], availableAirlines: [] };
        }

        const itineraries = searchResults.groupedItineraryResponse.itineraryGroups[0].itineraries;
        const prices = itineraries.map(it => parseFloat(it.pricingInformation[0].fare.totalFare.totalPrice));
        const durations = itineraries.map(it => {
            const legDesc = searchResults.groupedItineraryResponse.legDescs.find(
                leg => leg.id === it.legs[0].ref
            );
            return legDesc.elapsedTime;
        });

        const airlines = new Set();
        itineraries.forEach(it => {
            const legDesc = searchResults.groupedItineraryResponse.legDescs.find(
                leg => leg.id === it.legs[0].ref
            );
            legDesc.schedules.forEach(schedule => {
                const flight = searchResults.groupedItineraryResponse.scheduleDescs.find(
                    s => s.id === schedule.ref
                );
                airlines.add(flight.carrier.marketing);
            });
        });

        return {
            priceRange: [Math.min(...prices), Math.max(...prices)],
            durationRange: [Math.min(...durations), Math.max(...durations)],
            availableAirlines: Array.from(airlines)
        };
    }, [searchResults]);

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

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg space-y-4 sticky top-12">
            <h2 className="text-xl font-bold mb-4">Filters</h2>

            {/* Baggage Filter */}
            <FilterSection 
                title="Baggage Included" 
                isOpen={openSections.baggage}
                onToggle={() => toggleSection('baggage')}
            >
                <div className="mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.baggageIncluded}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                baggageIncluded: e.target.checked
                            }))}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span>Show only flights with baggage</span>
                    </label>
                </div>
            </FilterSection>

            {/* Airlines Filter */}
            <FilterSection 
                title="Airlines" 
                isOpen={openSections.airlines}
                onToggle={() => toggleSection('airlines')}
            >
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {availableAirlines.map(airline => (
                        <label key={airline} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={filters.airlines.includes(airline)}
                                onChange={(e) => {
                                    const newAirlines = e.target.checked 
                                        ? [...filters.airlines, airline]
                                        : filters.airlines.filter(a => a !== airline);
                                    setFilters(prev => ({
                                        ...prev,
                                        airlines: newAirlines
                                    }));
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span>{airline}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Price Range Filter */}
            <FilterSection 
                title="Price Range" 
                isOpen={openSections.price}
                onToggle={() => toggleSection('price')}
            >
                <div className="mt-4 px-2">
                    <PriceRangeInput
                        value={filters.priceRange}
                        min={priceRange[0]}
                        max={priceRange[1]}
                        onChange={(newValue) => setFilters(prev => ({
                            ...prev,
                            priceRange: newValue
                        }))}
                    />
                </div>
            </FilterSection>

            {/* Duration Filter */}
            <FilterSection 
                title="Duration" 
                isOpen={openSections.duration}
                onToggle={() => toggleSection('duration')}
            >
                <div className="mt-2">
                    <select
                        value={filters.duration}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            duration: e.target.value
                        }))}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="any">Any Duration</option>
                        <option value="4">Up to 4 hours</option>
                        <option value="8">4-8 hours</option>
                        <option value="12">8-12 hours</option>
                        <option value="13">12+ hours</option>
                    </select>
                </div>
            </FilterSection>

            {/* Stops Filter */}
            <FilterSection 
                title="Stops" 
                isOpen={openSections.stops}
                onToggle={() => toggleSection('stops')}
            >
                <div className="mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.nonStop}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                nonStop: e.target.checked
                            }))}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span>Non-stop flights only</span>
                    </label>
                </div>
            </FilterSection>

            {/* Reset Filters Button */}
            <button
                onClick={() => setFilters({
                    baggageIncluded: false,
                    airlines: [],
                    priceRange: priceRange,
                    duration: 'any',
                    nonStop: false
                })}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
                Reset Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
