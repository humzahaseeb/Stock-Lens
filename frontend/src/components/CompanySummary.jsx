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
            Showing a pinned data snapshot (live data temporarily unavailable).
          </p>
        )}
      </header>

      <NarrativeCard title="Business model" section={data.businessModel} />
      <MetricList title="Financial health" metrics={data.financialHealth?.metrics} />
      <NarrativeCard title="Competitive moat" section={data.competitiveMoat} />
      <MetricList title="Valuation" metrics={data.valuation?.metrics} />
      <NarrativeCard title="Bull case" section={data.bullCase} />
      <NarrativeCard title="Bear case" section={data.bearCase} />
      <NarrativeCard title="Analyst consensus" section={data.analystConsensus} />
    </article>
  );
}
