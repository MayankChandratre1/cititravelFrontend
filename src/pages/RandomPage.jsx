import React from 'react';
import useFlights from '../hooks/useFlights';
import useFlightSearch from '../hooks/useFlightSearch';
import FlightItineraries from '../components/Random/FlightIteniaryv1';
// import FlightItineraries from '../components/Random/FlightIteniary';

const RandomPage = () => {
    const { loading, error, searchParams } = useFlightSearch();
    const { cities, airlines, aircrafts, searchResults } = useFlights();

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;

    
    return (
        <>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                 <h2 className="text-xl font-bold mb-2">Search Parameters</h2>
                 <div className="grid grid-cols-2 gap-4">
                     <p>From: {searchParams.origin}</p>
                     <p>To: {searchParams.destination}</p>
                     <p>Date: {new Date(searchParams.departureDate).toLocaleDateString()}</p>
                     <p>Passengers: {searchParams.passengers}</p>
                 </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 <div className="bg-white p-4 rounded-lg shadow">
                     <h3 className="font-bold mb-2">Cities ({cities.length})</h3>
                     <div className="flex flex-wrap gap-2">
                         {cities.map(city => (
                             <span key={city.Id} className="px-2 py-1 bg-blue-100 rounded-full text-sm">
                                 {city.name}
                             </span>
                         ))}
                     </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg shadow">
                     <h3 className="font-bold mb-2">Airlines ({airlines.length})</h3>
                     <div className="flex flex-wrap gap-2">
                         {airlines.map(airline => (
                             <span key={airline} className="px-2 py-1 bg-green-100 rounded-full text-sm">
                                 {airline}
                             </span>
                         ))}
                     </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg shadow">
                     <h3 className="font-bold mb-2">Aircrafts ({aircrafts.length})</h3>
                     <div className="flex flex-wrap gap-2">
                         {aircrafts.map(aircraft => (
                             <span key={aircraft} className="px-2 py-1 bg-orange-100 rounded-full text-sm">
                                 {aircraft}
                             </span>
                         ))}
                     </div>
                 </div>
             </div>
            <FlightItineraries searchResults={searchResults} />
            
        </>
    )
};


export default RandomPage;