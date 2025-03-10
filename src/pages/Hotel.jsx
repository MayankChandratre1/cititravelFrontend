import React, { useState } from 'react';
import Navbar from '../components/Home/Navbar';
import SearchForm from '../components/Hotels/SearchForm';
import FilterSidebar from '../components/Hotels/FilterSidebar';
import HotelList from '../components/Hotels/HotelList';
import useHotels from '../hooks/useHotels';
import { useEffect } from 'react';

const Hotel = () => {
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],  // Changed to higher default range
    starRating: [],
    amenities: [],
    propertyTypes: [], // Changed from propertyType to propertyTypes
    distance: 'any'  // Added distance filter
  });

  const {searchResults} = useHotels();

  const applyFilters = (hotels) => {
    if (!hotels) return [];
    return hotels.filter(hotel => {
      const hotelInfo = hotel.HotelInfo;
      const rateInfo = hotel.HotelRateInfo;
      const lowestRate = rateInfo.RateInfos?.ConvertedRateInfo?.[0]?.AverageNightlyRate || 0;

      // Price Filter
      if (lowestRate < filters.priceRange[0] || lowestRate > filters.priceRange[1]) return false;

      // Star Rating Filter
      if (filters.starRating.length > 0 && !filters.starRating.includes(Math.floor(Number(hotelInfo.SabreRating)))) return false;

      // Property Type Filter
      if (filters.propertyTypes.length > 0) {
        const propertyTypes = hotelInfo.PropertyTypeInfo?.PropertyType || [];
        if (!propertyTypes.some(type => filters.propertyTypes.includes(type.Code))) return false;
      }

      // Amenity Filter
      if (filters.amenities.length > 0) {
        const hotelAmenities = hotelInfo.Amenities?.Amenity || [];
        if (!filters.amenities.every(amenity => 
          hotelAmenities.some(a => a.Code === amenity)
        )) return false;
      }

      // Distance Filter
      if (filters.distance !== 'any') {
        const distance = Number(hotelInfo.Distance);
        const [min, max] = filters.distance.split('-').map(Number);
        if (distance < min || distance > max) return false;
      }

      return true;
    });
  };

  const filteredHotels = searchResults ? {
    ...searchResults,
    GetHotelAvailRS: {
      ...searchResults.GetHotelAvailRS,
      HotelAvailInfos: {
        ...searchResults.GetHotelAvailRS.HotelAvailInfos,
        HotelAvailInfo: applyFilters(searchResults.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo)
      }
    }
  } : null;

  

  return (
    <main className="min-h-screen bg-gray-50">
      <div className='bg-blue-600 py-4'>
        <Navbar highlight={"white"} activeTab={"Hotel"} />
      </div>
      
      <SearchForm />
      
      <div className='grid grid-cols-1 md:grid-cols-6 gap-6 px-4 md:px-8 py-4'>
        {/* Mobile Filter Sidebar */}
        <div className='md:hidden col-span-6'>
          <FilterSidebar 
            results={searchResults} 
            filters={filters} 
            setFilters={setFilters}
          />
        </div>

        {/* Desktop Filter Sidebar */}
        <div className='hidden md:block col-span-2'>
          <FilterSidebar 
            results={searchResults} 
            filters={filters} 
            setFilters={setFilters}
          />
        </div>

        {/* Hotel List */}
        <div className='col-span-6 md:col-span-4'>
          <HotelList 
            results={filteredHotels} 
            filters={filters} 
          />
        </div>
      </div>
    </main>
  );
};

export default Hotel;