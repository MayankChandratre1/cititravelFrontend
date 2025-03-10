import React, { useState } from 'react';
import { Clock, Clock1, Luggage, Plane } from 'lucide-react';
import "../../styles/airline_logo.css";
import { airlines } from '../../lib/consts/airlines';
import useFlights from '../../hooks/useFlights';
import axiosInstance from '../../api/api';

const FlightItineraries = ({ searchResults }) => {
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [activeTab, setActiveTab] = useState('flight');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const {
    cities,
        sendRevalidation,
        formatTime,
        formatDuration,
        getScheduleById,
        getBaggageById,
        getItineraryDetails,
        isLowestPrice,
        hasBaggage,
        getRouteEndPoints,
        getScheduleDetails
  } = useFlights()
  


 

  if(!searchResults) {
    return <div className="flex justify-center items-center min-h-screen">No Data</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-4">
      {searchResults?.groupedItineraryResponse?.itineraryGroups[0].itineraries.map((itinerary) => {
        const details = getItineraryDetails(itinerary);
        const legDesc = searchResults?.groupedItineraryResponse?.legDescs.find(leg => leg.id === itinerary.legs[0].ref);
        const departureDate = searchResults.groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[0].departureDate;
        const firstFlight = getScheduleById(legDesc.schedules[0].ref);

        return (
          <div key={itinerary.id} className="bg-white rounded-lg border border-black shadow-md px-6 py-4 mb-4">
            {/* Status Badges */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-wrap gap-2">
                {isLowestPrice(details.price, searchResults.groupedItineraryResponse.itineraryGroups[0].itineraries) && (
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-sm">
                    Cheapest
                  </span>
                )}
                {hasBaggage(itinerary) && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Includes Baggage
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{details.currency} {details.price}</p>
                <p className="text-sm text-gray-500">per adult</p>
              </div>
            </div>
            <p className='flex items-center justify-center gap-2 border border-black rounded-md py-2'>Total: <Clock className='w-3 h-3' />{formatDuration(details.duration)}</p>

            {/* Flight Segments */}
            <div className="space-y-4">
              {legDesc.schedules.map((schedule, idx) => {
                const segment = getScheduleDetails(schedule, departureDate);
                const airlineName = airlines.find(a => a.code === segment.carrier.marketing)?.name;

                const departureAirport = cities.find(city => city.code == segment.departureAirport);
                
                const arrivalAirport = cities.find(city => city.code == segment.arrivalAirport);
                
                return (
                  <div key={idx} className={`${idx > 0 ? 'border-t-2 border-gray-700 pt-4' : ''} `}>
                    {/* {idx > 0 && (
                      <div className="text-center my-2 text-orange-600">
                        Layover: {formatDuration(schedule.connectionDuration)}
                      </div>
                    )} */}
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold flex items-center">
                      <div className={`w-32 h-32 md:w-56 md:h-56 scale-75 i-airline i-airline-${firstFlight.carrier.marketing.toLowerCase()}`}>
                      </div>
                        {airlineName} 
                      </p>
                      <span className="text-sm text-gray-500">
                        {segment.carrier.equipment.code}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-semibold">{segment.departureTime.time}</p>
                        <p className="text-sm text-gray-500">{segment.departureTime.date}</p>
                        <p className="text-base font-medium">{segment.departureCity}</p>
                      </div>

                      <div className="flex-1 px-4">
                        <div className="relative">
                          <div className="text-center mb-1 flex items-center justify-center gap-2">
                            <Clock className='w-5 h-5' />{formatDuration(segment.duration)}
                          </div>
                          <div className="border-t-2 border-gray-300 w-full"></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-semibold">{segment.arrivalTime.time}</p>
                        <p className="text-sm text-gray-500">{segment.arrivalTime.date}</p>
                        <p className="text-base font-medium">{segment.arrivalCity}</p>
                      </div>

                    </div>
                      <div className='flex justify-between items-center'>
                        <p className="text-sm text-start text-gray-500">{departureAirport ? `${departureAirport.name}, ${departureAirport.city}` : segment.departureAirport}</p>
                        <p className="text-sm text-end text-gray-500">{arrivalAirport ? `${arrivalAirport.name}, ${arrivalAirport.city}` : segment.arrivalAirport}</p>
                      </div>
                  </div>
                );
              })}
            </div>

            {/* Select Button */}
            <div className="mt-4 text-right">
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  setSelectedItinerary(itinerary);
                  setIsDetailsOpen(true);
                }}
              >
                Select
              </button>
            </div>
          </div>
        );
      })}

      {isDetailsOpen && selectedItinerary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Flight Details</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsDetailsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="flex border-b">
                {['flight', 'baggage', 'fare'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {activeTab === 'flight' && (
                <>
                  {searchResults?.groupedItineraryResponse?.legDescs.find(leg => leg.id === selectedItinerary.legs[0].ref)
                    .schedules.map((schedule, idx) => {
                    const flight = getScheduleById(schedule.ref);
                    return (
                      <div key={idx} className="bg-white rounded-lg border p-4">
                        <h3 className="font-semibold mb-2">
                          {flight.carrier.marketing} {flight.carrier.marketingFlightNumber}
                        </h3>
                        <div className="space-y-2">
                          <p>Aircraft: {flight.carrier.equipment.code}</p>
                          <p>Duration: {formatDuration(flight.elapsedTime)}</p>
                          <p>Terminal: {flight.departure.terminal || 'N/A'}</p>
                        </div>
                      </div>
                    );
                  })}

                  <button onClick={() => sendRevalidation(selectedItinerary)} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Revalidate
                  </button>
                </>
              )}

              {activeTab === 'baggage' && (
                <>
                  {getItineraryDetails(selectedItinerary).baggage.map((bag, idx) => {
                    const allowance = getBaggageById(bag.allowance.ref);
                    return (
                      <div key={idx} className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <Luggage />
                          <p>{allowance.weight} {allowance.unit}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {activeTab === 'fare' && (
                <div className="bg-white rounded-lg border p-4">
                  <div className="space-y-2">
                    {(() => {
                      const details = getItineraryDetails(selectedItinerary);
                      return (
                        <>
                          <div className="flex justify-between">
                            <p>Base Fare</p>
                            <p>{details.currency} {details.price - details.taxes}</p>
                          </div>
                          <div className="flex justify-between">
                            <p>Taxes & Fees</p>
                            <p>{details.currency} {details.taxes}</p>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-2">
                            <p>Total</p>
                            <p>{details.currency} {details.price}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightItineraries;