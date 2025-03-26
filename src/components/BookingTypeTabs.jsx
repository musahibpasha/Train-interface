const BookingTypeTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'book', label: 'Book Train Tickets' },
    { id: 'pnr', label: 'Check PNR Status' },
    { id: 'live', label: 'Live Train Status' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'book':
        return <BookingForm />;
      case 'pnr':
        return <PNRStatus />;
      case 'live':
        return <LiveTrainStatus />;
      default:
        return null;
    }
  };

  return (
    <div className="flex space-x-6 mb-4">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center">
          <input
            type="radio"
            id={tab.id}
            name="bookingType"
            checked={activeTab === tab.id}
            onChange={() => onTabChange(tab.id)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
          />
          <label
            htmlFor={tab.id}
            className="ml-2 text-gray-800 hover:text-purple-700 cursor-pointer"
          >
            {tab.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default BookingTypeTabs;
