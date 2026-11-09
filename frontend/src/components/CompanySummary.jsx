import DisclaimerBanner from './DisclaimerBanner.jsx';
import NarrativeCard from './NarrativeCard.jsx';
import MetricList from './MetricList.jsx';
import AnalystForecastCards from './AnalystForecastCards.jsx';
import IncomeStatementChart from './IncomeStatementChart.jsx';

export default function CompanySummary({ data }) {
  return (
    <article className="company-summary">
      <DisclaimerBanner text={data.disclaimer} />

      <header className="summary-header">
        <h1>
          {data.name} <span className="ticker-badge">{data.ticker}</span>
        </h1>
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
        </dl>
        {data.financialsSource === 'seed-cache' && (
          <p className="data-badge" role="status">
            📌 Showing a pinned data snapshot (live data temporarily unavailable).
          </p>
        )}
      </header>

      <div className="section-grid">
        <NarrativeCard title="Business model" icon="🏢" section={data.businessModel} />
        <MetricList
          title="Financial health"
          icon="💰"
          metrics={data.financialHealth?.metrics}
          note={data.financialHealth?.note}
          demoData={data.financialHealth?.demoData}
        />
        <IncomeStatementChart ticker={data.ticker} incomeStatements={data.incomeStatements} />
        <NarrativeCard title="Competitive moat" icon="🛡️" section={data.competitiveMoat} />
        <MetricList
          title="Valuation"
          icon="📊"
          metrics={data.valuation?.metrics}
          note={data.valuation?.note}
          demoData={data.valuation?.demoData}
        />
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
