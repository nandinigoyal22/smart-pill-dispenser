import { useState, useEffect } from 'react';
import { ref, query, orderByChild, startAt, endAt, limitToLast, get } from 'firebase/database';
import { database } from '../services/firebase';

export function useHistory(deviceId = 'pill_dispenser_01') {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Paginated Firebase query (20/page), filter by date range
  const fetchHistory = async (startDate, endDate, limit = 20) => {
    setLoading(true);
    try {
      const historyRef = ref(database, `history/${deviceId}`);
      
      // Assume date strings in ISO format for startAt/endAt
      let q = query(historyRef, orderByChild('actual_time'), limitToLast(limit));
      
      if (startDate && endDate) {
        q = query(historyRef, orderByChild('actual_time'), startAt(startDate), endAt(endDate), limitToLast(limit));
      }

      const snapshot = await get(q);
      const data = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key, ...child.val() });
      });
      // Reverse to get newest first
      setHistory(data.reverse());
    } catch (error) {
      console.error("Error fetching history:", error);
    }
    setLoading(false);
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

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    return csvContent;
  };

  useEffect(() => {
    fetchHistory();
    // Default fetch on mount
  }, [deviceId]);

  return { history, loading, fetchHistory, exportCSV };
}
