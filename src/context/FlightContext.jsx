import React, { createContext, useReducer, useContext } from 'react';
import axiosInstance from '../api/api';
import { CABIN_CLASSES, TRIP_TYPES } from '../lib/constants/flightConstants';
import { dummySearchResults } from '../lib/constants/dummyResults';

const initialState = {
    searchParams: {
        origin: '',
        destination: '',
        departureDate: '',
        CabinPref: {
            Cabin: CABIN_CLASSES[5].code // Default to Economy
        },
        PassengerTypeQuantity: [{
            Code: 'ADT',
            Quantity: 1
        }],
        TripType: TRIP_TYPES.ONE_WAY
    },
    searchResults: dummySearchResults,
    revalidationResults: null,
    revalidationLoading: false,
    revalidationError: null,
    loading: false,
    error: null
};

const FlightContext = createContext(undefined);

const flightReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_SEARCH_PARAMS':
            return {
                ...state,
                searchParams: { ...state.searchParams, ...action.payload }
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_RESULTS':
            return { ...state, searchResults: action.payload };
        case 'SET_REVALIDATION_RESULTS':
            return { ...state, revalidationResults: action.payload };
        case 'SET_REVALIDATION_LOADING':
            return { ...state, revalidationLoading: action.payload };
        case 'SET_REVALIDATION_ERROR':
            return { ...state, revalidationError: action.payload };
        default:
            return state;
    }
};

export const FlightProvider = ({ children }) => {
    const [state, dispatch] = useReducer(flightReducer, initialState);

    const getScheduleById = (id) => {
        return state.searchResults?.groupedItineraryResponse.scheduleDescs.find(schedule => schedule.id === id);
      };

    const searchFlights = async (params) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await axiosInstance.post('/api/v1/sabre/flights/search', params);
            dispatch({ type: 'SET_RESULTS', payload: response.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateSearchParams = (params) => {
        dispatch({ type: 'UPDATE_SEARCH_PARAMS', payload: params });
    };

    const updateRevalidationResults = (results) => {
        console.log("Setting revalidation: "+results);
        
        dispatch({ type: 'SET_REVALIDATION_RESULTS', payload: results });
    }


    const sendRevalidation = async (selectedItinerary) => {
        dispatch({ type: 'SET_REVALIDATION_LOADING', payload: true });
        dispatch({ type: 'SET_REVALIDATION_ERROR', payload: null });

        try {
            const data = {
                departureDate: '',
                origin: '',
                destination: '',
                Flight: [],
                PassengerTypeQuantity: [],
                OriginDestinationInformation: []
            }

            const OriginDestinationInformation = [];

            selectedItinerary.legs.forEach((leg, legIndex) => {
              const legDesc = state.searchResults?.groupedItineraryResponse?.legDescs.find(desc => desc.id === leg.ref);
              const legDepartureDate = state.searchResults.groupedItineraryResponse.itineraryGroups[0].groupDescription.legDescriptions[legIndex].departureDate;
              const schedules = legDesc.schedules.map(schedule => ({
                  ...getScheduleById(schedule.ref), 
                  departureDateAdjustment: schedule.departureDateAdjustment
              }));

              const depTime = schedules[0].departure.time.includes("+") ? schedules[0].departure.time.split("+")[0] : schedules[0].departure.time.split("-")[0];

              const data = {
                DepartureDateTime: legDepartureDate + 'T' + depTime,
                OriginLocation: {
                  LocationCode: schedules[0].departure.airport
                },
                DestinationLocation: {
                  LocationCode: schedules[schedules.length - 1].arrival.airport
                },
                TPA_Extensions:{
                  SegmentType: {
                                    "Code": "O"
                  },
                  Flight: []
                }
              }

              schedules.forEach(schedule => {
                let depDate = legDepartureDate;
                if (schedule.departureDateAdjustment) {
                    const adjustedDate = new Date(legDepartureDate);
                    adjustedDate.setDate(adjustedDate.getDate() + schedule.departureDateAdjustment);
                    depDate = adjustedDate.toISOString().split('T')[0];
                }

                let arrDate = new Date(depDate + 'T' + (schedule.departure.time.includes("+") 
                    ? schedule.departure.time.split("+")[0] 
                    : schedule.departure.time.split("-")[0]));
                arrDate.setMinutes(arrDate.getMinutes() + schedule.elapsedTime);
                arrDate = arrDate.toISOString().split('T')[0];

                data.TPA_Extensions.Flight.push({
                  DepartureDateTime: depDate + 'T' + (schedule.departure.time.includes("+")
                      ? schedule.departure.time.split("+")[0]
                      : schedule.departure.time.split("-")[0]).split("Z")[0],
                  ArrivalDateTime: arrDate + 'T' + (schedule.arrival.time.includes("+")
                      ? schedule.arrival.time.split("+")[0]
                      : schedule.arrival.time.split("-")[0]).split("Z")[0],
                  OriginLocation: {
                    LocationCode: schedule.departure.airport
                  },
                  DestinationLocation: {
                    LocationCode: schedule.arrival.airport
                  },
                  Airline:{
                    Operating: schedule.carrier.operating,
                    Marketing: schedule.carrier.marketing
                  },
                  Number: schedule.carrier.marketingFlightNumber,
                  ClassOfService: selectedItinerary.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.fareComponents[legIndex].segments[0].segment.bookingCode
                })
              })

              OriginDestinationInformation.push(data);
            })


            data.PassengerTypeQuantity = selectedItinerary.pricingInformation[0].fare.passengerInfoList.map(passenger => ({
                Code: passenger.passengerInfo.passengerType,
                Quantity: passenger.passengerInfo.passengerNumber
            }));


            data.OriginDestinationInformation = OriginDestinationInformation;



            const response = await axiosInstance.post('/api/v1/sabre/revalidate', data);
            updateRevalidationResults(response.data);
            return response.data;
        } catch (error) {
            dispatch({ type: 'SET_REVALIDATION_ERROR', payload: error.message || "Failed to revalidate" });
            throw error;
        } finally {
            dispatch({ type: 'SET_REVALIDATION_LOADING', payload: false });
        }
    };


    return (
        <FlightContext.Provider value={{ state, searchFlights, updateSearchParams, updateRevalidationResults, sendRevalidation }}>
            {children}
        </FlightContext.Provider>
    );
};

export default FlightContext;
