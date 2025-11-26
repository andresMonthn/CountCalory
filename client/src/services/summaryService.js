const API_SUMMARY = import.meta.env.VITE_API_URL + '/summary';

export async function getSummaryHistory() {
  try {
    const res = await fetch(API_SUMMARY, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) throw new Error('Response is not JSON');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveSummaryData(payload) {
  const res = await fetch(API_SUMMARY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorData}`);
  }
  return await res.json();
}
