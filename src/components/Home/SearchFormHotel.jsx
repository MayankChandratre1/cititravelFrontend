import React, { useState } from 'react'
import "react-datepicker/dist/react-datepicker.css"
import AutocompleteInput from './AutoComplete'
import DateInput from './DateInput'
import ModalTrigger from './ModalTrigger'




const SearchFormHotel = ({activeTab, setActiveTab, menu}) => {

    const [search, setSearch] = useState({
        location: '',
        checkIn: null,
        checkOut: null,
        rooms: [{ adults: 1, children: 0 }]
    });

    const [showRoomModal, setShowRoomModal] = useState(false);
    
    // Mock data for locations
    const locations = [
        { code: 'DEL', name: 'Delhi, India' },
        { code: 'BOM', name: 'Mumbai, India' },
        { code: 'NYC', name: 'New York, USA' },
    ];

    return (
        <div className='relative bg-white rounded-xl w-[95%] md:w-4/5 h-fit pb-10 mt-24 mx-auto'>
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

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 px-4 md:px-12'>
                <div className='col-span-3'>
                    <div className='max-md:space-y-2 md:flex md:h-[90px]'>
                        <AutocompleteInput 
                            label="City/Hotel"
                            value={search.location}
                            options={locations}
                            onChange={(value) => setSearch({...search, location: value})}
                        />

                        <DateInput 
                            label="Check-in"
                            date={search.checkIn}
                            onChange={(date) => setSearch({...search, checkIn: date})}
                        />

                        <DateInput 
                            label="Check-out"
                            date={search.checkOut}
                            onChange={(date) => setSearch({...search, checkOut: date})}
                        />
                    </div>
                </div>

                <div className='col-span-1 flex max-md:mt-2'>
                    <ModalTrigger 
                        onClick={() => setShowRoomModal(true)}
                        label="Rooms & Guests"
                    >
                        <p className="text-sm">
                            {search.rooms.length} Room(s),{' '}
                            {search.rooms.reduce((acc, room) => acc + room.adults + room.children, 0)} Guest(s)
                        </p>
                    </ModalTrigger>
                </div>
            </div>

            <div className='flex justify-center items-center absolute w-full -bottom-0 translate-y-1/2'>
                <button className='w-1/2 mx-auto bg-[#ea0309] text-white py-2 rounded-lg hover:bg-[#ea0309]'>
                    Search
                </button>
            </div>

            <RoomModal
                show={showRoomModal}
                onClose={() => setShowRoomModal(false)}
                rooms={search.rooms}
                setRooms={(rooms) => setSearch({...search, rooms})}
            />
        </div>
    )
}

const RoomModal = ({ show, onClose, rooms, setRooms }) => {
    if (!show) return null;

    const addRoom = () => {
        setRooms([...rooms, { adults: 1, children: 0 }]);
    };

    const removeRoom = (index) => {
        if (rooms.length > 1) {
            setRooms(rooms.filter((_, i) => i !== index));
        }
    };

    const updateRoom = (index, field, value) => {
        const newRooms = [...rooms];
        if (field === 'adults' && value < 1) return; // At least 1 adult required
        newRooms[index] = { ...newRooms[index], [field]: value };
        setRooms(newRooms);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-4 md:p-6 rounded-lg w-[90%] md:w-96">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Rooms & Guests</h3>
                
                {rooms.map((room, index) => (
                    <div key={index} className="mb-6 pb-4 border-b">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Room {index + 1}</h4>
                            {rooms.length > 1 && (
                                <button 
                                    onClick={() => removeRoom(index)}
                                    className="text-red-500 text-sm"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        {/* Adults */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-medium text-sm md:text-base">Adults</p>
                                <p className="text-xs md:text-sm text-gray-500">Ages 13+</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => updateRoom(index, 'adults', room.adults - 1)}
                                    className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
                                >-</button>
                                <span>{room.adults}</span>
                                <button 
                                    onClick={() => updateRoom(index, 'adults', room.adults + 1)}
                                    className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
                                >+</button>
                            </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm md:text-base">Children</p>
                                <p className="text-xs md:text-sm text-gray-500">Ages 0-12</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => updateRoom(index, 'children', room.children - 1)}
                                    className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
                                >-</button>
                                <span>{room.children}</span>
                                <button 
                                    onClick={() => updateRoom(index, 'children', room.children + 1)}
                                    className="w-8 h-8 rounded-full border border-orange-500 text-orange-500"
                                >+</button>
                            </div>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={addRoom}
                    className="w-full py-2 mb-4 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50"
                >
                    Add Room
                </button>

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

// You can reuse AutocompleteInput, DateInput, and ModalTrigger components from SearchForm.tsx
// Just copy them here or create shared components

export default SearchFormHotel;