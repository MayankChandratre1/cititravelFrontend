import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {  Users, Calendar, ChevronDown, Type,  } from 'lucide-react';
import useAirports from '../../hooks/useAirports';
import useHotels from '../../hooks/useHotels';

const SearchForm = () => {
    const [search, setSearch] = useState({
        location: '',
        checkIn: null,
        checkOut: null,
        rooms: [{ adults: 1, children: 0 }]
    });

    const [showRoomModal, setShowRoomModal] = useState(false);
    const {
        searchHotels,
        searchResults
    } = useHotels()
    
    const handleSearch = async () => {
        if (!search.location || !search.checkIn || !search.checkOut) {
            return;
        }
try {
        
    const payload = {
        SearchCriteria: {
            OffSet: 1,
            SortOrder: "ASC",
            PageSize: 20,
            GeoSearch: {
                GeoRef: {
                    Radius: 200,
                    UOM: "MI",
                    RefPoint: {
                        Value: search.location,
                        ValueContext: "CODE",
                        RefPointType: "6"
                    }
                }
            },
            RateInfoRef: {
                CurrencyCode: "USD",
                BestOnly: "4",
                StayDateTimeRange: {
                    StartDate: search.checkIn.toISOString().split('T')[0],
                    EndDate: search.checkOut.toISOString().split('T')[0]
                },
                Rooms: {
                    Room: search.rooms.map((room, index) => ({
                        Index: index + 1,
                        Adults: room.adults,
                        ...(room.children > 0 && { Children: room.children })
                    }))
                }
            },
            ImageRef:{
                Type: "THUMBNAIL",
                LanguageCode: "EN"
            }
        }
    };

    console.log('Search payload:', payload);
    // Here you would call your search API with the payload
    await searchHotels(payload);
    console.log("Search Results", searchResults);
} catch (error) {
    console.log(error);
    
}
        
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 mx-auto max-w-7xl mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location Input */}
                <div className="relative">
                    <div className="relative">
                        <AutocompleteInput 
                        label={"Location"}
                        value={search.location}
                        onChange={(value) => setSearch({ ...search, location: value })}
                        />
                    </div>
                </div>

                {/* Check-in Date */}
                <div className="relative p-2 border border-orange-400/30 flex-1">
                    <label className="block text-xs md:text-sm text-gray-600">Check-in</label>
                    <div className="relative">
                        <DatePicker
                            selected={search.checkIn}
                            onChange={date => setSearch({ ...search, checkIn: date })}
                            minDate={new Date()}
                            placeholderText="Select date"
                            className="w-full p-2 border-none rounded text-base md:text-2xl"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Check-out Date */}
                <div className="relative p-2 border border-orange-400/30 flex-1">
                    <label className="block text-xs md:text-sm text-gray-600">Check-out</label>
                    <div className="relative">
                        <DatePicker
                            selected={search.checkOut}
                            onChange={date => setSearch({ ...search, checkOut: date })}
                            minDate={search.checkIn || new Date()}
                            placeholderText="Select date"
                            className="w-full p-2 border-none rounded text-base md:text-2xl"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Rooms & Guests */}
                <div className="relative p-2 border border-orange-400/30 flex-1">
                    <label className="block text-xs md:text-sm text-gray-600">Rooms & Guests</label>
                    <button
                        onClick={() => setShowRoomModal(true)}
                        className="w-full p-2 flex items-center justify-between border-none rounded text-base md:text-2xl"
                    >
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-gray-400" />
                            <span>
                                {search.rooms.length} Room{search.rooms.length > 1 ? 's' : ''}, 
                                {' '}{search.rooms.reduce((acc, room) => acc + room.adults + room.children, 0)} Guest{search.rooms.reduce((acc, room) => acc + room.adults + room.children, 0) > 1 ? 's' : ''}
                            </span>
                        </div>
                        <ChevronDown size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Search Button */}
                <div className="md:col-span-4 mt-4">
                    <button
                        onClick={handleSearch}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Search Hotels
                    </button>
                </div>
            </div>

            {/* Room Modal */}
            <RoomModal 
                show={showRoomModal}
                onClose={() => setShowRoomModal(false)}
                rooms={search.rooms}
                setRooms={rooms => setSearch({ ...search, rooms })}
            />
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


const RoomModal = ({ show, onClose, rooms, setRooms }) => {
    if (!show) return null;

    const addRoom = () => {
        setRooms([...rooms, { adults: 1, children: 0 }]);
    };

    const updateRoom = (index, field, value) => {
        const newRooms = [...rooms];
        if (field === 'adults' && value < 1) return;
        if (value < 0) return;
        newRooms[index] = { ...newRooms[index], [field]: value };
        setRooms(newRooms);
    };

    const removeRoom = (index) => {
        if (rooms.length > 1) {
            setRooms(rooms.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 max-w-[90%]">
                <h3 className="text-xl font-semibold mb-4">Rooms & Guests</h3>
                <div className="max-h-[60vh] overflow-y-auto">
                    {rooms.map((room, index) => (
                        <div key={index} className="border-b pb-4 mb-4">
                            <div className="flex justify-between mb-4">
                                <h4 className="font-medium">Room {index + 1}</h4>
                                {rooms.length > 1 && (
                                    <button
                                        onClick={() => removeRoom(index)}
                                        className="text-red-500 text-sm"
                                    >
                                        Remove Room
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Adults</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="w-8 h-8 rounded-full border"
                                            onClick={() => updateRoom(index, 'adults', room.adults - 1)}
                                        >-</button>
                                        <span>{room.adults}</span>
                                        <button
                                            className="w-8 h-8 rounded-full border"
                                            onClick={() => updateRoom(index, 'adults', room.adults + 1)}
                                        >+</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Children</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="w-8 h-8 rounded-full border"
                                            onClick={() => updateRoom(index, 'children', room.children - 1)}
                                        >-</button>
                                        <span>{room.children}</span>
                                        <button
                                            className="w-8 h-8 rounded-full border"
                                            onClick={() => updateRoom(index, 'children', room.children + 1)}
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-3 mt-4">
                    <button
                        onClick={addRoom}
                        className="w-full py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
                    >
                        Add Another Room
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchForm;
