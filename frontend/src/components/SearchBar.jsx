import { useState } from 'react';

const EXAMPLES = [
  { ticker: 'NVDA', label: 'NVIDIA (NVDA)' },
  { ticker: 'RR.L', label: 'Rolls-Royce (RR.L)' },
];

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor="ticker-input">Company ticker</label>
      <div className="search-row">
        <input
          id="ticker-input"
          name="ticker"
          type="text"
          placeholder="e.g. NVDA"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          aria-describedby="ticker-hint"
        />
        <button type="submit" disabled={loading || !value.trim()}>
          {loading ? 'Loading…' : 'Analyse'}
        </button>
      </div>
      <p id="ticker-hint" className="hint">
        Try a worked example:{' '}
        {EXAMPLES.map((ex, i) => (
          <span key={ex.ticker}>
            <button
              type="button"
              className="link-button"
              onClick={() => onSearch(ex.ticker)}
              disabled={loading}
            >
              {ex.label}
            </button>
            {i < EXAMPLES.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </p>
    </form>
  );
}
