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
  
  export default ModalTrigger;