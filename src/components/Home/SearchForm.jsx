import React, { useEffect, useState } from 'react'
import { Calendar, Users, Plane, Trash2 } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import useAirports from '../../hooks/useAirports';
import { useNavigate } from 'react-router-dom';
import useFlightSearch from '../../hooks/useFlightSearch';
import { CABIN_CLASSES, PASSENGER_TYPES, TRIP_TYPES } from '../../lib/constants/flightConstants';
import { airlines } from '../../lib/consts/airlines';



const SearchForm = ({activeTab, setActiveTab, menu}) => {
    const navigate = useNavigate();
    const { searchFlights, updateSearchParams } = useFlightSearch();
    const [tripType, setTripType] = useState('oneWay');
    const [showTravellerModal, setShowTravellerModal] = useState(false);
    const [showAirlinesModal, setShowAirlinesModal] = useState(false);
    const {airports, setQuery, query} = useAirports()
    
    const [flights, setFlights] = useState([{
      origin: '',
      destination: '',
      departureDate: null,
    }]);

    const [stopovers, setStopovers] = useState([]);

    const [travellers, setTravellers] = useState({
      adults: 1,
      children: 0,
      infants: 0,
      class: 'Economy'
    });

    const [selectedAirlines, setSelectedAirlines] = useState([]);
   


    const addFlight = () => {
      if (tripType === 'multiCity') {
        setFlights([...flights, { origin: '', destination: '', departureDate: null }]);
      }
    };

    const removeFlight = (index) => {
      const newFlights = flights.filter((_, i) => i !== index);
      setFlights(newFlights);
    };

    const updateFlight = (index, field, value) => {
      const newFlights = [...flights];
      newFlights[index] = { ...newFlights[index], [field]: value };
      setFlights(newFlights);
    };

    const addStopover = () => {
      setStopovers([...stopovers, { location: '', date: null }]);
    };
    
    const removeStopover = (index) => {
      const newStopovers = stopovers.filter((_, i) => i !== index);
      setStopovers(newStopovers);
    };
    
    const updateStopover = (index, field, value) => {
      const newStopovers = [...stopovers];
      newStopovers[index] = { ...newStopovers[index], [field]: value };
      setStopovers(newStopovers);
    };

    // Modify setTripType to reset flights when changing trip type
    const handleTripTypeChange = (type) => {
        setTripType(type);
        if (type === 'oneWay') {
            setFlights([{
                origin: '',
                destination: '',
                departureDate: null
            }]);
        } else if (type === 'roundTrip') {
            setFlights([{
                origin: '',
                destination: '',
                departureDate: null,
                returnDate: null
            }]);
        }
    };

    const formatPassengerPayload = (travellers) => {
        const passengers = [];
        
        if (travellers.adults > 0) {
            passengers.push({
                Code: PASSENGER_TYPES.ADULT,
                Quantity: travellers.adults
            });
        }
        
        if (travellers.children > 0) {
            passengers.push({
                Code: PASSENGER_TYPES.CHILD,
                Quantity: travellers.children
            });
        }
        
        if (travellers.infants > 0) {
            passengers.push({
                Code: PASSENGER_TYPES.INFANT,
                Quantity: travellers.infants
            });
        }
        
        return passengers;
    };

    const handleSearch = async () => {
        const cabinClass = CABIN_CLASSES.find(c => c.label === travellers.class);

        let BrandFilters = null;
                // Add BrandFilters if airlines are selected
                if (selectedAirlines.length > 0) {
                  BrandFilters = {
                      Brand: selectedAirlines.map(code => ({
                          Code: code,
                          PreferLevel: "Preferred"
                      }))
                  };
              }
      

        const flightsData = flights.map((flight, index) => ({
          DepartureDateTime: `${flight.departureDate?.toLocaleDateString("en-CA").replaceAll("/","-")}T00:00:00`,
          DestinationLocation: { 
              LocationCode: flight.destination 
          },
          OriginLocation: { 
              LocationCode: flight.origin
          },
          TPA_Extensions: {
              CabinPref:{Cabin : cabinClass.code}|| { Cabin: "Y" },
              BrandFilters: BrandFilters || {},
          },
          RPH: index.toString()
      }))

      if(tripType === 'roundTrip'){
        const returnFlight = flightsData[0]
        flightsData.push({
          DepartureDateTime: `${flights[0].returnDate?.toLocaleDateString("en-CA").replaceAll("/","-")}T00:00:00`,
          DestinationLocation: returnFlight.OriginLocation,
          OriginLocation: returnFlight.DestinationLocation,
          TPA_Extensions: {
              CabinPref:{Cabin : cabinClass.code} || { Cabin: "Y" },
              BrandFilters: BrandFilters || {},
          },
        })
      }

      if(stopovers.length > 0 && stopovers[0].location != ""){
        flightsData[0].TPA_Extensions.Stopover = {
          StopoverPoint:{
            LocationCode: stopovers[0].location,
          },
          DepartureDateTime: `${stopovers[0].date?.toLocaleDateString("en-CA").replaceAll("/","-")}T00:00:00`
        }
      }

        const searchData = {
          flightsData,
          PassengerTypeQuantity: formatPassengerPayload(travellers),
          TripType: tripType === 'oneWay' ? TRIP_TYPES.ONE_WAY : 
                        tripType === 'roundTrip' ? TRIP_TYPES.ROUND_TRIP : 
                        TRIP_TYPES.MULTI_CITY
        };

        updateSearchParams(searchData);
        await searchFlights(searchData);
        navigate('/flight');
    };

    return (
      <div className='relative bg-white rounded-xl w-[95%] md:w-4/5 h-fit pb-10 mx-auto mt-24'>
        <div className='bg-white w-[90%] md:w-1/2 h-auto md:h-[100px] shadow-md rounded-md relative -top-12 mx-auto flex flex-wrap md:flex-nowrap py-4 pb-2 gap-4 md:gap-24 px-4 md:px-12'>
            {
                menu.map((item, index) => (
                    <button onClick={()=>{
                        setActiveTab(item.label)
                    }} key={index} className={`flex flex-col items-center justify-center w-[45%] md:w-1/4 h-full ${
                        activeTab === item.label
                          ? 'text-[#ea0309] border-b-4 border-[#ea0309] pb-4'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}>
                        <img src={item.icon} alt={item.label} className='object-contain w-8 md:w-12 h-8 md:h-12' />
                        <p className={
                            `${
                                activeTab === item.label ?
                                "text-red-500 font-bold":"text-gray-600"
                            } text-sm md:text-base`
                        }>{item.label}</p>
                    </button>
                ))
            }
        </div>
        <div className='flex flex-wrap md:flex-nowrap gap-4 md:gap-8 px-4 md:px-12 mt-0'>
            <label className='flex items-center gap-2 cursor-pointer'>
                <input
                    type="radio"
                    name="tripType"
                    value="oneWay"
                    checked={tripType === 'oneWay'}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="form-radio h-3 w-3 md:h-4 md:w-4 text-[#ea0309] focus:ring-[#ea0309]"
                />
                <span className='text-gray-700 text-sm md:text-base'>One Way</span>
            </label>
            
            <label className='flex items-center gap-2 cursor-pointer'>
                <input
                    type="radio"
                    name="tripType"
                    value="roundTrip"
                    checked={tripType === 'roundTrip'}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="form-radio h-4 w-4 text-[#ea0309] focus:ring-[#ea0309]"
                />
                <span className='text-gray-700'>Round Trip</span>
            </label>
            
            <label className='flex items-center gap-2 cursor-pointer'>
                <input
                    type="radio"
                    name="tripType"
                    value="multiCity"
                    checked={tripType === 'multiCity'}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="form-radio h-4 w-4 text-[#ea0309] focus:ring-[#ea0309]"
                />
                <span className='text-gray-700'>Multi City</span>
            </label>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 px-4 md:px-12 mt-4 '>
          <div className={`${tripType == "multiCity" ? "col-span-4":"col-span-3"} `}>
            {
              flights.map((flight, index) => (
                <div className={`max-md:space-y-2 md:flex md:h-[90px] ${tripType == "multiCity" ? "border-b pb-2 mb-2 ":"border-none"}`} key={index}>
                    <AutocompleteInput 
                      label="Origin"
                      value={flight.origin}
                      options={airports}
                      onChange={(value) => updateFlight(index, 'origin', value)}
                    />
                    <AutocompleteInput 
                      label="Destination"
                      value={flight.destination}
                      options={airports}
                      onChange={(value) => updateFlight(index, 'destination', value)}
                    />

                    <DateInput 
                      label="Departure Date"
                      date={flight.departureDate}
                      onChange={(date) => updateFlight(index, 'departureDate', date)}
                    />

                    {
                      tripType== "roundTrip" && (
                        <DateInput 
                          label="Return Date"
                          date={flight.returnDate}
                          onChange={(date) => updateFlight(index, 'returnDate', date)}
                        />
                      )
                    }

                    {
                      tripType == "multiCity" && index != 0 && (
                        <button 
                          onClick={() => removeFlight(index)}
                          className=" px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 mx-2 h-fit"
                        >
                          Remove
                        </button>
                      )
                    }
                </div>
              ))
            }

            {
              tripType == "multiCity" && (
                <button 
                  onClick={addFlight}
                  className="my-2 px-2 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Add Flight
                </button>
              )
            }
          </div>
          <div className='col-span-1 flex max-md:mt-2'>
              <ModalTrigger 
                onClick={() => setShowTravellerModal(true)}
                label="Travellers"
              >
                <p className="text-sm">
                    {travellers.adults + travellers.children + travellers.infants} Traveller(s),{' '}
                    {travellers.class}
                  </p>
              </ModalTrigger>
              <ModalTrigger 
                onClick={() => setShowAirlinesModal(true)}
                label="Airlines"
              >
                <p className="text-sm">
                    {selectedAirlines.length ? selectedAirlines.join(', ') : 'Any Airline'}
                  </p>
              </ModalTrigger>
          </div>
        </div>

       {
          tripType != "multiCity" && ( <div className='px-4 md:px-12 mt-4'>

            {
              stopovers.map((stopover, index) => (
                <div className='flex gap-4 mb-2' key={index}>
                  <AutocompleteInput 
                    label="Stopover Location"
                    value={stopover.location}
                    options={airports}
                    onChange={(value) => updateStopover(index, 'location', value)}
                  />
                  <DateInput 
                    label="Stopover Date"
                    date={stopover.date}
                    onChange={(date) => updateStopover(index, 'date', date)}
                  />
                  <button 
                    onClick={() => removeStopover(index)}
                    className=" h-fit"
                  >
                    <Trash2 color={"red"} size={16} />
                  </button>
                </div>
              ))
            }
            {
              stopovers.length < 1 && <button 
              onClick={addStopover}
              className="my-1 px-2 py-2 text-blue-500 font-semibold"
            >
             + Add Stopover
            </button>
            }
          </div>)
       }

        <div className='flex justify-center items-center absolute w-full -bottom-0 translate-y-1/2'>
          <button 
            onClick={handleSearch}
            className='w-1/2 mx-auto bg-[#ea0309] text-white py-2 rounded-lg hover:bg-[#ea0309]'
          >
            Search
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-12 mt-4'>
          <TravellerModal
            show={showTravellerModal}
            onClose={() => setShowTravellerModal(false)}
            travellers={travellers}
            setTravellers={setTravellers}
          />

          <AirlinesModal
            show={showAirlinesModal}
            onClose={() => setShowAirlinesModal(false)}
            airlines={airlines}
            selected={selectedAirlines}
            setSelected={setSelectedAirlines}
          />
        </div>
        
      </div>
    )
}


const ModalTrigger = ({ onClick, children, label }) => {
  return (
    <div className="relative p-2 border border-orange-400/30 flex-1">
      <label className="block text-xs md:text-sm text-gray-600">{label}</label>
      <button 
        onClick={onClick}
        className="w-full p-2 border-none rounded text-sm md:text-base text-left">
        {children}
      </button>
    </div>
  );
}

const AutocompleteInput = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toShow, setToShow] = useState(options);
  const {airports, setQuery, query, searchAirports} = useAirports()


  useEffect(()=>{
    if(value.length > 2){
      searchAirports(value)
    }else{
      setToShow([])
    }
  },[value])

  useEffect(()=>{
    console.log(airports);
    
    setToShow(airports)
  },[airports])
  
  return (
    <div className="relative p-2 border border-orange-400/30 flex-1">
      <label className="block text-xs md:text-sm text-gray-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
         
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full p-2 border-none rounded text-base md:text-2xl"
        placeholder={label}
      />
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded-b shadow-lg">
          {toShow.map((option) => (
            <div
              key={option.code}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm md:text-base"
              onClick={() => {
                onChange(option.code);
                setIsOpen(false);
              }}
            >
              {option.name}, {option.city} ({option.code})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DateInput = ({ label, date, onChange }) => {
  return (
    <div className='relative p-2 border border-orange-400/30 flex-1'>
      <label className="block text-xs md:text-sm text-gray-600">{label}</label>
      <DatePicker
        selected={date}
        onChange={onChange}
        dateFormat="dd MMM"
        className="w-full p-2 border-none rounded text-base md:text-2xl"
        placeholderText='Select Date'
      />
    </div>
  );
};

const TravellerModal = ({ show, onClose, travellers, setTravellers }) => {
  if (!show) return null;

  const updateTraveller = (type, value) => {
    if (type === 'adults' && value < 1) return; // At least 1 adult required
    setTravellers({ ...travellers, [type]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-4 md:p-6 rounded-lg w-[90%] md:w-96">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Travellers & Class</h3>
        
        {/* Adults */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-sm md:text-base">Adults</p>
            <p className="text-xs md:text-sm text-gray-500">12+ years</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateTraveller('adults', travellers.adults - 1)}
              className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
            >-</button>
            <span>{travellers.adults}</span>
            <button 
              onClick={() => updateTraveller('adults', travellers.adults + 1)}
              className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
            >+</button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-sm md:text-base">Children</p>
            <p className="text-xs md:text-sm text-gray-500">2-11 years</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateTraveller('children', travellers.children - 1)}
              className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
            >-</button>
            <span>{travellers.children}</span>
            <button 
              onClick={() => updateTraveller('children', travellers.children + 1)}
              className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
            >+</button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-medium text-sm md:text-base">Infants</p>
            <p className="text-xs md:text-sm text-gray-500">0-2 years</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateTraveller('infants', travellers.infants - 1)}
              className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
            >-</button>
            <span>{travellers.infants}</span>
            <button 
              onClick={() => updateTraveller('infants', travellers.infants + 1)}
              className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
            >+</button>
          </div>
        </div>

        {/* Class Selection */}
        <div className="mb-4">
          <p className="font-medium mb-2 text-sm md:text-base">Class</p>
          <select 
            value={travellers.class}
            onChange={(e) => setTravellers({ ...travellers, class: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {CABIN_CLASSES.map(cabin => (
              <option key={cabin.code} value={cabin.label}>
                {cabin.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const AirlinesModal = ({ show, onClose, airlines, selected, setSelected }) => {
  if (!show) return null;

  const toggleAirline = (code) => {
    if (selected.includes(code)) {
      setSelected(selected.filter(item => item !== code));
    } else {
      setSelected([...selected, code]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-4 md:p-6 rounded-lg w-[90%] md:w-96">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Select Airlines</h3>
        
        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {airlines.map(airline => (
            <label key={airline.code} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer text-sm md:text-base">
              <input
                type="checkbox"
                checked={selected.includes(airline.code)}
                onChange={() => toggleAirline(airline.code)}
                className="rounded text-orange-500 focus:ring-orange-500"
              />
              {airline.name}
            </label>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SearchForm;