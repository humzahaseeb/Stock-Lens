import DisclaimerBanner from './DisclaimerBanner.jsx';
import NarrativeCard from './NarrativeCard.jsx';
import MetricList from './MetricList.jsx';

export default function CompanySummary({ data }) {
  const generated = data.generatedAt ? new Date(data.generatedAt).toLocaleString() : null;

  return (
    <article className="company-summary">
      <DisclaimerBanner text={data.disclaimer} />

      <header className="summary-header">
        <h1>
          {data.name} <span className="ticker-badge">{data.ticker}</span>
        </h1>
        {generated && <p className="generated-at">Summary generated {generated}</p>}
        {data.financialsSource === 'seed-cache' && (
          <p className="data-badge" role="status">
            📌 Showing a pinned data snapshot (live data temporarily unavailable).
          </p>
        )}
      </header>

      <div className="section-grid">
        <NarrativeCard title="Business model" icon="🏢" section={data.businessModel} />
        <MetricList title="Financial health" icon="💰" metrics={data.financialHealth?.metrics} />
        <NarrativeCard title="Competitive moat" icon="🛡️" section={data.competitiveMoat} />
        <MetricList title="Valuation" icon="📊" metrics={data.valuation?.metrics} />
        <NarrativeCard title="Bull case" icon="📈" section={data.bullCase} />
        <NarrativeCard title="Bear case" icon="📉" section={data.bearCase} />
        <NarrativeCard title="Analyst consensus" icon="🎯" section={data.analystConsensus} />
      </div>
    </article>
  );
}
