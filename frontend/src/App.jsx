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
          <span aria-hidden="true">📈</span> Stock Lens
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
