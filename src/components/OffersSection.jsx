const OffersSection = () => {
  const tabs = [
    { id: 'trains', label: 'Trains', isActive: true },
    { id: 'all', label: 'All Offers' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'flights', label: 'Flights' },
    { id: 'holidays', label: 'Holidays' },
    { id: 'bus', label: 'Bus' },
    { id: 'cabs', label: 'Cabs' },
  ];

  return (
    <div className="bg-white pt-4 pb-8 shadow-sm mt-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--purple-dark)' }}>Offers</h2>
          <a href="#" className="text-purple-600 flex items-center hover:text-purple-800">
            VIEW ALL
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`px-4 py-2 cursor-pointer ${
                tab.isActive
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-500'
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 flex hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">T&C'S APPLY</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--purple-dark)' }}>Enjoy Power-packed Deals for Your Next Trip:</h3>
              <p className="text-sm text-gray-600">Get exclusive discounts and offers on train tickets</p>
            </div>
            <div className="w-24 h-24 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 flex hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">T&C'S APPLY</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--purple-dark)' }}>Presenting TRIP GUARANTEE on Trains</h3>
              <p className="text-sm text-gray-600">Book with confidence with our guarantee program</p>
            </div>
            <div className="w-24 h-24 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersSection;
