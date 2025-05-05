import { useState } from 'react';

const PNRStatus = () => {
  const [pnrNumber, setPnrNumber] = useState('');
  const [pnrStatus, setPnrStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckPNR = async () => {
    if (!pnrNumber) {
      setError('Please enter a PNR number');
      return;
    }

    if (pnrNumber.length !== 10) {
      setError('PNR number must be 10 digits');
      return;
    }

    setLoading(true);
    setError('');
    setPnrStatus(null);

    try {
      const response = await fetch(`/api/pnr-status/${pnrNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PNR status');
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the API response

      if (data.ResponseCode === "404" || data.ResponseCode === "401") {
        throw new Error(data.Message || 'Invalid PNR number');
      }

      setPnrStatus(data);
      console.log('PNR Status Set:', data); // Log the PNR status being set
    } catch (err) {
      console.error('PNR Status Error:', err);
      setError(err.message || 'Failed to fetch PNR status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Check PNR Status</h2>
        
        <div className="mb-6">
          <label htmlFor="pnrNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Enter PNR Number
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              id="pnrNumber"
              value={pnrNumber}
              onChange={(e) => setPnrNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 10 digit PNR number"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={10}
            />
            <button
              onClick={handleCheckPNR}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                If the problem persists, please try again later or contact support.
              </p>
            </div>
          )}
        </div>

        {pnrStatus && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">PNR Status Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Train Number</p>
                  <p className="font-medium">{pnrStatus.TrainNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Train Name</p>
                  <p className="font-medium">{pnrStatus.TrainName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">From Station</p>
                  <p className="font-medium">{pnrStatus.FromStation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To Station</p>
                  <p className="font-medium">{pnrStatus.ToStation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Journey Date</p>
                  <p className="font-medium">{pnrStatus.JourneyDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium">{pnrStatus.Class || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">Passenger Status</h4>
                <div className="bg-gray-50 rounded-md p-4">
                  {pnrStatus.PassengerStatus?.length > 0 ? (
                    pnrStatus.PassengerStatus.map((passenger, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p className="text-sm">
                          <span className="font-medium">Passenger {index + 1}:</span> {passenger}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No passenger information available</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">Chart Status</h4>
                <p className="text-sm">{pnrStatus.ChartStatus || 'Not available'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PNRStatus;