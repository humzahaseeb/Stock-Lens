import { useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import CompanySummary from './components/CompanySummary.jsx';
import { fetchCompany } from './lib/api.js';
import './index.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(ticker) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCompany(ticker);
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="app-header">
        <h1 className="app-title">
          <svg
            className="app-mark"
            viewBox="0 0 36 36"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="1" y="1" width="34" height="34" rx="10" className="app-mark-bg" />
            <path d="M8 26h20" className="app-mark-axis" />
            <path d="m8 22 6-6 5 4 9-11" className="app-mark-trend" />
            <path d="M22 9h6v6" className="app-mark-arrow" />
          </svg>
          <span>Stock Lens</span>
        </h1>
        <p className="app-subtitle">
          A one-page, structured research summary for any company — every figure sourced and
          dated.
        </p>
      </header>

      <SearchBar onSearch={handleSearch} loading={loading} />

      <div aria-live="polite" className="status-region">
        {loading && (
          <p className="loading-message">
            <span className="spinner" aria-hidden="true" /> Loading summary…
          </p>
        )}
        {error && (
          <p role="alert" className="error-message">
            ⚠ {error}
          </p>
        )}
      </div>

      {data && <CompanySummary data={data} />}
    </main>
  );
}

export default App;
