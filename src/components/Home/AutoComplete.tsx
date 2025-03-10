import React, { useEffect, useState } from "react";

const AutocompleteInput = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toShow, setToShow] = useState(options);


  useEffect(()=>{
    if(value.length > 0){
      setToShow(options.filter(option => option.name.toLowerCase().includes(value.toLowerCase()) || option.code.toLowerCase().includes(value.toLowerCase())))
    }else{
      setToShow(options)
    }
  },[value])
  
  return (
    <div className="relative p-2 border border-orange-400/30 bg-white flex-1">
      <label className="block text-xs md:text-sm text-gray-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
              {option.name} ({option.code})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;