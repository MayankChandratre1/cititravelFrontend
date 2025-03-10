import DatePicker from "react-datepicker";

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

export default DateInput;