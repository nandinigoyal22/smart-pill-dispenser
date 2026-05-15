import { useState, useEffect } from 'react';

// Shared global mock state so changes sync across screens
let mockHistoryDB = [
  { id: '1', type: 'Dispense', slot: '1', med_name: 'Aspirin', scheduled_time: '08:00', actual_time: new Date().toISOString(), temp: 22, humidity: 45 },
  { id: '2', type: 'Refill', slot: '2', med_name: 'Vitamin C', scheduled_time: 'N/A', actual_time: new Date(Date.now() - 86400000).toISOString(), temp: 21, humidity: 44 }
];

export function useHistory(deviceId = 'pill_dispenser_01') {
  const [history, setHistory] = useState(mockHistoryDB);
  const [loading, setLoading] = useState(false);

  // Background sync for the mock DB!
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory([...mockHistoryDB]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addHistoryEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      actual_time: new Date().toISOString(),
    };
    mockHistoryDB = [newEvent, ...mockHistoryDB]; // Sync global
    setHistory([...mockHistoryDB]); // Update local
  };

  const fetchHistory = async (startDate, endDate, limit = 20) => {
    // Force immediate sync
    setHistory([...mockHistoryDB]);
  };

  const exportCSV = () => {
    if (!history || history.length === 0) return '';
    const headers = ['Type', 'Slot', 'Med Name', 'Scheduled Time', 'Actual Time', 'Temp', 'Humidity'];
    const rows = history.map(row => [
      row.type || '',
      row.slot || '',
      row.med_name || '',
      row.scheduled_time || '',
      row.actual_time || '',
      row.temp || '',
      row.humidity || ''
    ]);

    return [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  };

  return { history, loading, fetchHistory, exportCSV, addHistoryEvent };
}
