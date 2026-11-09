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
      <h1 className="app-title">Stock Lens</h1>
      <p className="app-subtitle">
        A one-page, structured research summary for any company — every figure sourced and
        dated.
      </p>

      <SearchBar onSearch={handleSearch} loading={loading} />

      <div aria-live="polite" className="status-region">
        {loading && <p>Loading summary…</p>}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
      </div>

      {data && <CompanySummary data={data} />}
    </main>
  );
}

export default App;
