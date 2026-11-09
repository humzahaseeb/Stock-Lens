import { useId, useState } from 'react';

const metricExplanations = {
  'Revenue (TTM)': 'Total sales over the trailing 12 months. TTM means trailing twelve months.',
  'Net profit margin': 'Net income divided by revenue, shown as a percentage of sales retained as profit.',
  'Debt / Equity': "Total debt divided by shareholders' equity; a measure of financial leverage.",
  'Current ratio': 'Current assets divided by current liabilities; a snapshot of short-term bill-paying ability.',
  'Free cash flow (TTM)': 'Cash remaining after operating costs and capital investment over the trailing 12 months.',
  Price: 'The latest share price included in the data response.',
  'P/E (TTM)': 'Share price divided by earnings per share from the trailing 12 months.',
  'Forward P/E': 'Share price divided by forecast earnings per share, based on the estimates supplied by the data source.',
  'EV / EBITDA': 'Enterprise value divided by EBITDA; compares total company value with operating earnings before interest, taxes, depreciation, and amortization.',
  'EPS (TTM)': 'Earnings per share over the trailing 12 months.',
  'Market cap': 'Share price multiplied by the number of outstanding shares.',
};

export default function MetricList({ title, icon, metrics, note, demoData }) {
  const demoMetric = Array.isArray(metrics) ? metrics.find((metric) => metric.source || metric.asOf) : null;

  return (
    <section className="summary-section" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>
        {icon && <span aria-hidden="true">{icon}</span>} {title}
      </h2>
      {metrics && metrics.length > 0 ? (
        <dl className="metric-list">
          {metrics.map((m) => (
            <div className="metric-row" key={m.label}>
              <dt>
                {m.label}
                <MetricTermHelp label={m.label} />
              </dt>
              <dd>
                <span className="metric-value">{m.value}</span>
                {(!demoData || m.source !== 'Synthetic demo data') && (
                  <span className="metric-source">
                    {m.source}, {m.asOf}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="empty-state">
          No live data available right now — showing what we have from cached/manual sources
          only. Try again later or check the backend has an FMP_API_KEY configured.
        </p>
      )}
      {note && (
        <p className="metric-list-note" role="status">
          {note}
        </p>
      )}
      {demoData && demoMetric && (
        <p className="metric-source metric-source-footer">
          {demoMetric.source}
          {demoMetric.asOf ? `, ${demoMetric.asOf}` : ''}
        </p>
      )}
    </section>
  );
}

function MetricTermHelp({ label }) {
  const explanation = metricExplanations[label];
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  if (!explanation) return null;

  return (
    <span className={`metric-term-help${open ? ' is-open' : ''}`}>
      <button
        type="button"
        aria-label={`Explain ${label}`}
        aria-describedby={tooltipId}
        aria-expanded={open}
        aria-controls={tooltipId}
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        i
      </button>
      <span className="metric-tooltip" id={tooltipId} role="tooltip">
        {explanation}
      </span>
    </span>
  );
}
