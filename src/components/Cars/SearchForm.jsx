import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, MapPin } from 'lucide-react';
import useAirports from '../../hooks/useAirports';
import useCars from '../../hooks/useCars';

const SearchForm = () => {
    const { searchCars } = useCars();
    const [search, setSearch] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        pickupDate: null,
        pickupTime: null,
        dropoffDate: null,
        dropoffTime: null,
        sameLocation: true
    });

    const handleSearch = async () => {
        if (!search.pickupLocation || !search.pickupDate || !search.dropoffDate || !search.pickupTime || !search.dropoffTime) {
            return;
        }

        const pickupDateTime = new Date(search.pickupDate);
        const [hours, minutes] = search.pickupTime.split(':');
        pickupDateTime.setHours(parseInt(hours), parseInt(minutes));

        const dropoffDateTime = new Date(search.dropoffDate);
        const [dropHours, dropMinutes] = search.dropoffTime.split(':');
        dropoffDateTime.setHours(parseInt(dropHours), parseInt(dropMinutes));

        const payload = {
            SearchCriteria: {
                RentalLocRef: [{
                    PickUpLocation: [{
                        ExtendedLocationCode: search.pickupLocation,
                        LocationCode: search.pickupLocation
                    }],
                    ReturnLocation: {
                        ExtendedLocationCode: search.sameLocation ? search.pickupLocation : search.dropoffLocation,
                        LocationCode: search.sameLocation ? search.pickupLocation : search.dropoffLocation
                    }
                }],
                PickUpDate: pickupDateTime.toISOString().split('T')[0],
                PickUpTime: search.pickupTime,
                ReturnDate: dropoffDateTime.toISOString().split('T')[0],
                ReturnTime: search.dropoffTime,
                ImageRef: {
                    Image: [{
                        Type: "ORIGINAL"
                    }]
                },
                LocPolicyRef: {
                    Include: true
                },
                RatePrefs: {
                    CurrencyCode: "USD",
                    ConvertedRateInfoOnly: false,
                    SupplierCurrencyOnly: true
                },
                VendorPrefs: {
                    VendorPref: [{
                        Code: "ZI"
                    }]
                }
            }
        };

        await searchCars(payload);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 mx-auto max-w-7xl mt-4">
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        checked={!search.sameLocation}
                        onChange={(e) => setSearch({ ...search, sameLocation: !e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                    />
                    <label className="text-sm text-gray-600">Need a different drop-off location?</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="col-span-1">
                        <AutocompleteInput 
                            label="Pickup Location"
                            value={search.pickupLocation}
                            onChange={(value) => setSearch({ ...search, pickupLocation: value })}
                            icon={<MapPin size={20} className="text-gray-400" />}
                        />
                    </div>

                    {!search.sameLocation && (
                        <div className="col-span-1">
                            <AutocompleteInput 
                                label="Drop-off Location"
                                value={search.dropoffLocation}
                                onChange={(value) => setSearch({ ...search, dropoffLocation: value })}
                                icon={<MapPin size={20} className="text-gray-400" />}
                            />
                        </div>
                    )}

                    <div className={`col-span-1 ${!search.sameLocation ? 'lg:col-span-1' : 'lg:col-span-2'} grid grid-cols-2 gap-2`}>
                        <div className="col-span-1">
                            <DateInput 
                                label="Pickup Date"
                                date={search.pickupDate}
                                onChange={(date) => setSearch({ ...search, pickupDate: date })}
                            />
                        </div>
                        <div className="col-span-1">
                            <TimeInput
                                label="Pickup Time"
                                value={search.pickupTime}
                                onChange={(time) => setSearch({ ...search, pickupTime: time })}
                            />
                        </div>
                    </div>

                    <div className={`col-span-1 ${!search.sameLocation ? 'lg:col-span-1' : 'lg:col-span-1'} grid grid-cols-2 gap-2`}>
                        <div className="col-span-1">
                            <DateInput 
                                label="Drop-off Date"
                                date={search.dropoffDate}
                                onChange={(date) => setSearch({ ...search, dropoffDate: date })}
                                minDate={search.pickupDate}
                            />
                        </div>
                        <div className="col-span-1">
                            <TimeInput
                                label="Drop-off Time"
                                value={search.dropoffTime}
                                onChange={(time) => setSearch({ ...search, dropoffTime: time })}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Search Cars
                </button>
            </div>
        </div>
    );
};

const AutocompleteInput = ({ label, value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const {airports, setQuery, query, searchAirports} = useAirports()
    const [toShow, setToShow] = useState(airports);
  
  
    useEffect(()=>{
      if(value.length > 2){
        searchAirports(value)
      }else{
        setToShow([])
      }
    },[value])
  
    useEffect(()=>{
      
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
    <div className='relative p-2 border border-blue-400/60 flex-1'>
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

const TimeInput = ({ label, value, onChange }) => {
    return (
        <div className='relative p-2 border border-blue-400/60 flex-1'>
            <label className="block text-xs md:text-sm text-gray-600">{label}</label>
            <input
                type="time"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border-none rounded text-base md:text-2xl"
            />
        </div>
    );
};

export default SearchForm;
