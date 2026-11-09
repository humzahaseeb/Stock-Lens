import DisclaimerBanner from './DisclaimerBanner.jsx';
import NarrativeCard from './NarrativeCard.jsx';
import MetricList from './MetricList.jsx';
import AnalystForecastCards from './AnalystForecastCards.jsx';

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
        <dl className="company-facts">
          <div>
            <dt>CEO</dt>
            <dd>
              {data.ceo || 'Unavailable'}
              {data.ceoSource && (
                <span className="fact-source">
                  {data.ceoSource}
                  {data.ceoAsOf ? ` · ${data.ceoAsOf}` : ''}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt>Market cap</dt>
            <dd>
              {data.marketCap ? `${data.marketCap} ${data.marketCapCurrency || ''}`.trim() : 'Unavailable'}
              {data.marketCapSource && (
                <span className="fact-source">
                  {data.marketCapSource}
                  {data.marketCapAsOf ? ` · ${data.marketCapAsOf}` : ''}
                </span>
              )}
            </dd>
          </div>
        </dl>
        <dl className="company-facts company-facts-secondary">
          <div>
            <dt>P/E ratio</dt>
            <dd>{data.peRatio || 'Unavailable'}</dd>
          </div>
          <div>
            <dt>EPS</dt>
            <dd>{data.eps || 'Unavailable'}</dd>
          </div>
          <div>
            <dt>Quarterly dividend</dt>
            <dd>{data.quarterlyDividend || 'Unavailable'}</dd>
          </div>
        </dl>
        {(!data.ceo || !data.marketCap) && (
          <p className="facts-unavailable">
            Missing company facts require a live FMP response or a seeded data snapshot.
          </p>
        )}
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
        <AnalystForecastCards
          ticker={data.ticker}
          consensus={data.analystConsensus}
          valuationMetrics={data.valuation?.metrics}
        />
      </div>
    </article>
  );
}
