import { useState } from 'react';

const ClassPicker = ({ selectedClass, onClassSelect, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const classes = [
    { id: 'all', name: 'ALL', description: 'All Class' },
    { id: '1a', name: '1A', description: 'First AC' },
    { id: '2a', name: '2A', description: 'Second AC' },
    { id: '3a', name: '3A', description: 'Third AC' },
    { id: 'sl', name: 'SL', description: 'Sleeper' },
    { id: 'cc', name: 'CC', description: 'Chair Car' },
    { id: 'ec', name: 'EC', description: 'Exec. Chair Car' },
  ];

  return (
    <div className="relative">
      {label && <div className="text-sm text-gray-500">{label}</div>}
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-3xl font-bold text-gray-900">{selectedClass?.name || 'ALL'}</div>
        <div className="text-sm text-gray-600">{selectedClass?.description || 'All Class'}</div>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 w-56">
          <div className="p-2 border-b border-gray-200">
            <div className="text-sm font-medium">Select Class</div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onClassSelect(cls);
                  setIsOpen(false);
                }}
              >
                <div className="flex-1">
                  <div className="font-medium">{cls.name}</div>
                  <div className="text-sm text-gray-600">{cls.description}</div>
                </div>
                {selectedClass?.id === cls.id && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPicker;
