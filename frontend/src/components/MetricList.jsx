export default function MetricList({ title, icon, metrics }) {
  return (
    <section className="summary-section" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>
        {icon && <span aria-hidden="true">{icon}</span>} {title}
      </h2>
      {metrics && metrics.length > 0 ? (
        <dl className="metric-list">
          {metrics.map((m) => (
            <div className="metric-row" key={m.label}>
              <dt>{m.label}</dt>
              <dd>
                <span className="metric-value">{m.value}</span>
                <span className="metric-source">
                  {m.source}, {m.asOf}
                </span>
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
    </section>
  );
}
