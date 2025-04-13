import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePicker = ({ selectedDate, onDateSelect = (date) => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Format the date as shown in the screenshot: "24 Mar' 25"
  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month}' ${year}`;
  };

  // Get day of week
  const getDayOfWeek = (date) => {
    if (!date) return '';
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };

  // Handle date change from the date picker
  const handleDateChange = (date) => {
    onDateSelect(date);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={datePickerRef}>
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-sm text-gray-500">Travel Date</div>
        <div className="text-3xl font-bold text-gray-900">{formatDate(selectedDate)}</div>
        <div className="text-sm text-gray-600">{getDayOfWeek(selectedDate)}</div>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20">
          <div className="p-3">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              minDate={new Date()}
              monthsShown={1}
              showDisabledMonthNavigation
              className="!outline-none"
              calendarClassName="custom-calendar"
              dayClassName={date =>
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
                  ? "bg-blue-500 text-white rounded-full"
                  : undefined
              }
            />
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
              <button
                className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded"
                onClick={() => handleDateChange(new Date())}
              >
                Today
              </button>
              <button
                className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleDateChange(tomorrow);
                }}
              >
                Tomorrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CustomDatePicker.defaultProps = {
  selectedDate: new Date(),
  onDateSelect: () => {}
};

const YourParentComponent = () => {
  const [date, setDate] = useState(new Date());

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
  };

  return (
    <CustomDatePicker 
      selectedDate={date}
      onDateSelect={handleDateSelect}
    />
  );
};

export default CustomDatePicker;
