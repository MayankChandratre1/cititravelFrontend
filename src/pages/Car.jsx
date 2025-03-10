import React, { useState } from 'react';
import Navbar from '../components/Home/Navbar';
import SearchForm from '../components/Cars/SearchForm';
import useCars from '../hooks/useCars';
import FilterSidebar from '../components/Cars/FilterSidebar';
import CarList from '../components/Cars/CarList';

const Car = () => {
  const { searchResults } = useCars();
  console.log("Car Page Results:", searchResults); // Add debug logging

  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    carTypes: [],
    vendors: [],
    mileage: null
  });



  return (
    <main className="min-h-screen bg-gray-50">
      <div className='bg-blue-600 py-4'>
        <Navbar highlight={"white"} activeTab={"Car"} />
      </div>
      
      <SearchForm />
      
      <div className='grid grid-cols-1 md:grid-cols-6 gap-6 px-4 md:px-8 py-4'>
        <div className='hidden md:block col-span-2'>
          <FilterSidebar
            results={searchResults?.GetVehAvailRS} 
            filters={filters} 
            setFilters={setFilters}
          />
        </div>

        <div className='col-span-6 md:col-span-4'>
          
            <CarList
              results={searchResults?.GetVehAvailRS} 
              filters={filters} 
            />
          
        </div>
      </div>
    </main>
  );
};

export default Car;
