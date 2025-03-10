import { useState, useEffect } from 'react';
import useFlightSearch from './useFlightSearch';
import axiosInstance from '../api/api';

const useFlights = () => {
    const { searchResults, revalidationResults, sendRevalidation, revalidationError, revalidationLoading } = useFlightSearch();
    const [cities, setCities] = useState(new Set());
    const [airlines, setAirlines] = useState(new Set());
    const [aircrafts, setAircrafts] = useState(new Set());
    
   

    const getCityDetails = async (cities) => {
        try{
            const cityDetails = await axiosInstance.post('/api/v1/sabre/geocodes',{
                codes: cities,
                type:"AIR"
            })
            setCities(new Set(cityDetails.data.Response));
            return cityDetails.data.Response;
        }catch(e){
            console.log(e);
            return [];
        }
    }

    useEffect(() => {
        if (searchResults?.groupedItineraryResponse?.scheduleDescs) {
            const newCities = new Set();
            const newAirlines = new Set();
            const newAircrafts = new Set();

            searchResults.groupedItineraryResponse.scheduleDescs.forEach(schedule => {
                // Collect cities
                if (schedule.departure?.airport) {
                    newCities.add(schedule.departure.airport);
                }
                if (schedule.arrival?.airport) {
                    newCities.add(schedule.arrival.airport);
                }

                // Collect airlines
                if (schedule.carrier?.marketing) {
                    newAirlines.add(schedule.carrier.marketing);
                }

                // Collect aircraft codes
                if (schedule.carrier?.equipment?.code) {
                    newAircrafts.add(schedule.carrier.equipment.code);
                }
            });

            

            getCityDetails(Array.from(newCities));
            setAirlines(newAirlines);
            setAircrafts(newAircrafts);
        }
    }, [searchResults]);


    // const sendRevalidation = async (selectedItinerary) => {
    //     setRevalidationLoading(true);
    //     setRevalidationError(null);

    //     try {
    //         const data = {
    //             departureDate: '',
    //             origin: '',
    //             destination: '',
    //             Flight: [],
    //             PassengerTypeQuantity: [],
    //             OriginDestinationInformation: []
    //         }

    //         const OriginDestinationInformation = [];

    //         selectedItinerary.legs.forEach((leg, legIndex) => {
    //           const legDesc = searchResults?.groupedItineraryResponse?.legDescs.find(desc => desc.id === leg.ref);
    //           const legDepartureDate = searchResults.groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[legIndex].departureDate;
    //           const schedules = legDesc.schedules.map(schedule => ({
    //               ...getScheduleById(schedule.ref), 
    //               departureDateAdjustment: schedule.departureDateAdjustment
    //           }));

    //           const data = {
    //             DepartureDateTime: legDepartureDate + 'T' + schedules[0].departure.time.split("+")[0],
    //             OriginLocation: {
    //               LocationCode: schedules[0].departure.airport
    //             },
    //             DestinationLocation: {
    //               LocationCode: schedules[schedules.length - 1].arrival.airport
    //             },
    //             TPA_Extensions:{
    //               SegmentType: {
    //                                 "Code": "O"
    //               },
    //               Flight: []
    //             }
    //           }

    //           schedules.forEach(schedule => {
    //             let depDate = legDepartureDate;
    //             if (schedule.departureDateAdjustment) {
    //                 const adjustedDate = new Date(legDepartureDate);
    //                 adjustedDate.setDate(adjustedDate.getDate() + schedule.departureDateAdjustment);
    //                 depDate = adjustedDate.toISOString().split('T')[0];
    //             }

    //             let arrDate = new Date(depDate + 'T' + (schedule.departure.time.includes("+") 
    //                 ? schedule.departure.time.split("+")[0] 
    //                 : schedule.departure.time.split("-")[0]));
    //             arrDate.setMinutes(arrDate.getMinutes() + schedule.elapsedTime);
    //             arrDate = arrDate.toISOString().split('T')[0];

    //             data.TPA_Extensions.Flight.push({
    //               DepartureDateTime: depDate + 'T' + (schedule.departure.time.includes("+")
    //                   ? schedule.departure.time.split("+")[0]
    //                   : schedule.departure.time.split("-")[0]),
    //               ArrivalDateTime: arrDate + 'T' + (schedule.arrival.time.includes("+")
    //                   ? schedule.arrival.time.split("+")[0]
    //                   : schedule.arrival.time.split("-")[0]),
    //               OriginLocation: {
    //                 LocationCode: schedule.departure.airport
    //               },
    //               DestinationLocation: {
    //                 LocationCode: schedule.arrival.airport
    //               },
    //               Airline:{
    //                 Operating: schedule.carrier.operating,
    //                 Marketing: schedule.carrier.marketing
    //               },
    //               Number: schedule.carrier.marketingFlightNumber,
    //               ClassOfService: selectedItinerary.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.fareComponents[legIndex].segments[0].segment.bookingCode
    //             })
    //           })

    //           OriginDestinationInformation.push(data);
    //         })


    //         data.PassengerTypeQuantity = selectedItinerary.pricingInformation[0].fare.passengerInfoList.map(passenger => ({
    //             Code: passenger.passengerInfo.passengerType,
    //             Quantity: passenger.passengerInfo.passengerNumber
    //         }));


    //         data.OriginDestinationInformation = OriginDestinationInformation;



    //         const response = await axiosInstance.post('/api/v1/sabre/revalidate', data);
    //         updateRevalidationResults(response.data);
    //         return response.data;
    //     } catch (error) {
    //         setRevalidationError(error.message || 'Failed to revalidate flight');
    //         throw error;
    //     } finally {
    //         setRevalidationLoading(false);
    //     }
    // };
    
    


    const formatTime = (timeString, dateString) => {
        const date = new Date(dateString);
        if(timeString.includes("+")) {}
        return {
          time: new Date(`1970-01-01T${timeString.includes("+")? timeString.split("+")[0]:timeString.split("-")[0]}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          date: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
        };
      };
    
      const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      };
    
      const getScheduleById = (id) => {
        return searchResults?.groupedItineraryResponse.scheduleDescs.find(schedule => schedule.id === id);
      };
    
      const getBaggageById = (id) => {
        return searchResults?.groupedItineraryResponse.baggageAllowanceDescs.find(baggage => baggage.id === id);
      };
    
      const getItineraryDetails = (itinerary) => {
        const pricing = itinerary.pricingInformation[0].fare;
        const firstLeg = itinerary.legs[0].ref;
        return {
          price: pricing.totalFare.totalPrice,
          currency: pricing.totalFare.currency,
          taxes: pricing.totalFare.totalTaxAmount,
          baggage: pricing.passengerInfoList[0].passengerInfo.baggageInformation,
          duration: searchResults?.groupedItineraryResponse.legDescs.find(leg => leg.id === firstLeg)?.elapsedTime
        };
      };
    
      const isLowestPrice = (price, allItineraries) => {
        const allPrices = allItineraries.map(it => getItineraryDetails(it).price);
        return price === Math.min(...allPrices);
      };
    
      const hasBaggage = (itinerary) => {
        const details = getItineraryDetails(itinerary);
        return details.baggage &&  details.baggage.some(bag => {
          const allowance = getBaggageById(bag.allowance.ref);
          return allowance && allowance.weight > 0;
        });
      };
    
      const getRouteEndPoints = (legDesc, groupedDescription) => {
        const firstSchedule = getScheduleById(legDesc.schedules[0].ref);
        const lastSchedule = getScheduleById(legDesc.schedules[legDesc.schedules.length - 1].ref);
        const departureDate = new Date(groupedDescription.departureDate);
        const arrivalDate = new Date(departureDate);
    
        arrivalDate.setMinutes(arrivalDate.getMinutes() + legDesc.elapsedTime);
    
        
        return {
          start: {
          city: firstSchedule.departure.city,
          time: firstSchedule.departure.time,
          date: departureDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          airport: firstSchedule.departure.airport
          },
          end: {
          city: lastSchedule.arrival.city,
          time: lastSchedule.arrival.time,
          date: arrivalDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          airport: lastSchedule.arrival.airport
          },
          layovers: legDesc.schedules.length - 1
        };
      };
    
      const getScheduleDetails = (schedule, departureDate) => {
        const flight = getScheduleById(schedule.ref);
        const flightDate = new Date(departureDate);
        
        // If not first segment, add elapsed time from previous segments
        if (schedule.departureDateAdjustment) {
          flightDate.setDate(flightDate.getDate() + schedule.departureDateAdjustment);
        }
    
        return {
          departureTime: formatTime(flight.departure.time, flightDate.toISOString()),
          arrivalTime: formatTime(flight.arrival.time, flightDate.toISOString()),
          departureAirport: flight.departure.airport,
          arrivalAirport: flight.arrival.airport,
          departureCity: flight.departure.city,
          arrivalCity: flight.arrival.city,
          carrier: flight.carrier,
          duration: flight.elapsedTime
        };
      };

      const getLegDesc = (it)=>{
        const legs = it.legs.map(leg => leg.ref);
        console.log("Legs: ",legs);
        
        const legDescs = searchResults?.groupedItineraryResponse.legDescs;
        console.log("LegDescs: ",legDescs);
        const itLegs = legDescs.filter(leg => legs.includes(leg.id));
        console.log("FilteredLegDescs: ",itLegs);
        return itLegs;
      }

   

    return {
        cities: Array.from(cities),
        airlines: Array.from(airlines),
        aircrafts: Array.from(aircrafts),
        searchResults,
        sendRevalidation,
        formatTime,
        formatDuration,
        getScheduleById,
        getBaggageById,
        getItineraryDetails,
        getLegDesc,
        isLowestPrice,
        hasBaggage,
        getRouteEndPoints,
        getScheduleDetails,
        revalidationResults,
        revalidationError,
        revalidationLoading
    };
};

export default useFlights;
