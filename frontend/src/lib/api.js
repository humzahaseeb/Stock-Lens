const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Fetches the one-page company summary from the backend. Throws an Error
 * with a user-facing message on any non-2xx response or network failure.
 */
export async function fetchCompany(ticker) {
  const res = await fetch(`${API_BASE_URL}/api/company/${encodeURIComponent(ticker)}`);
  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error('The server returned an unexpected response. Please try again.');
  }
  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }
  return body;
}

export async function fetchStockChart(ticker, range, signal) {
  const res = await fetch(
    `${API_BASE_URL}/api/company/${encodeURIComponent(ticker)}/stock-chart?range=${encodeURIComponent(range)}`,
    { signal },
  );
  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error('The server returned an unexpected stock-chart response. Please try again.');
  }
  if (!res.ok) {
    throw new Error(body?.error || `Stock chart request failed with status ${res.status}`);
  }
  return body;
}
