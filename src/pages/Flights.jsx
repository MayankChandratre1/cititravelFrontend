import React, { useEffect, useState } from 'react';
import Navbar from '../components/Home/Navbar';
import SearchForm from '../components/Flights/SearchForm';
import FlightItineraries from '../components/Random/FlightIteniaryv1';
import FilterSidebar from '../components/Flights/FilterSidebar';
import useFlights from '../hooks/useFlights';

const Flights = () => {
  const { searchResults } = useFlights();
  const [filters, setFilters] = useState({
    baggageIncluded: false,
    airlines: [],
    priceRange: [0, 10000],
    duration: 'any',
    nonStop: false
  });
  const {
    cities,
    sendRevalidation,
    revalidationLoading,
    revalidationError,
    formatTime,
    formatDuration,
    getScheduleById,
    getBaggageById,
    getItineraryDetails,
    isLowestPrice,
    hasBaggage,
    getLegDesc,
    getRouteEndPoints,
    getScheduleDetails,
  } = useFlights()

  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    if (!searchResults) return;

    let filtered = searchResults.groupedItineraryResponse.itineraryGroups[0].itineraries;

    if (filters.baggageIncluded) {
        filtered = filtered.filter(it => hasBaggage(it));
    }
    
    if (filters.airlines.length > 0) {
        filtered = filtered.filter(it => {
        const legDesc = getLegDesc(it);
        
        const airlines = legDesc[0].schedules.map(schedule => getScheduleById(schedule.ref).carrier.marketing);
        console.log(airlines);
        
        return filters.airlines.some(airline => airlines.includes(airline));
      });
    }

    filtered = filtered.filter(it => {
      const price = parseFloat(it.pricingInformation[0].fare.totalFare.totalPrice);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    if (filters.duration !== 'any') {
      filtered = filtered.filter(it => {
        const {duration} = getItineraryDetails(it);
        
        if (filters.duration === '4') {
          return duration <= 360;
        } else if (filters.duration === '8') {
          return duration > 360 && duration <= 480;
        } else if (filters.duration === '12') {
          return duration > 480 && duration <= 720;
        } else if (filters.duration === '13') {
            return duration > 720;
        }
      });
    }

    if (filters.nonStop) {
      filtered = filtered.filter(it => {
        const legDesc = getLegDesc(it);
        return legDesc[0].schedules.length === 1;
      });
    }

    console.log('Filtered Results:', filtered.map(it => it.id));
    

    setFilteredResults(filtered.map(it => it.id));
  }, [searchResults, filters]);

  return (
    <main>
      <div className='bg-blue-600 py-4'>
        <Navbar highlight={"white"} activeTab={"Flight"} />
      </div>
      <SearchForm />
      <div className='grid grid-cols-1 md:grid-cols-6 gap-6 px-4 md:px-8 py-4'>
        <div
        
        className='md:hidden col-span-6'>
            <FilterSidebar 
                searchResults={searchResults} 
                filters={filters} 
                setFilters={setFilters}
            />
        </div>
        <div className='hidden md:block col-span-2'>
          <FilterSidebar 
            searchResults={searchResults} 
            filters={filters} 
            setFilters={setFilters}
          />
        </div>
        <div className='col-span-6 md:col-span-4'>
          <FlightItineraries searchResults={searchResults} filtered={filteredResults}  filters={filters} />
        </div>
      </div>
    </main>
  );
};

export default Flights;
