import { useEffect, useState } from 'react';
import { getSummaryHistory } from '@/services/summaryService';

export function useHistoryPolling(enabled) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    let intervalId;
    async function load() {
      const data = await getSummaryHistory();
      setHistory(data);
    }
    load();
    if (enabled) {
      intervalId = setInterval(load, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled]);
  const refresh = async () => {
    const data = await getSummaryHistory();
    setHistory(data);
  };
  return { history, refresh };
}
