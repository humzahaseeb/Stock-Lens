import { useState } from 'react';
import DisclaimerBanner from './DisclaimerBanner.jsx';
import NarrativeCard from './NarrativeCard.jsx';
import MetricList from './MetricList.jsx';
import AnalystForecastCards from './AnalystForecastCards.jsx';
import IncomeStatementChart from './IncomeStatementChart.jsx';
import StockPriceChart, { formatPrice } from './StockPriceChart.jsx';

export default function CompanySummary({ data }) {
  const [stockQuote, setStockQuote] = useState(null);
  const activeQuote = stockQuote?.ticker === data.ticker ? normalizeQuote(stockQuote) : null;
  const valuationMetrics = (data.valuation?.metrics || []).map((metric) =>
    metric.label === 'Price' && activeQuote
      ? {
          ...metric,
          value: formatPrice(activeQuote.price, activeQuote.currency),
          source: stockQuote.source,
          asOf: new Date(stockQuote.asOf * 1000).toISOString().slice(0, 10),
        }
      : metric,
  );

  return (
    <article className="company-summary">
      <DisclaimerBanner text={data.disclaimer} />

      <header className="summary-header">
        <h1>
          {data.name} <span className="ticker-badge">{data.ticker}</span>
        </h1>
        {data.financialsSource === 'seed-cache' && (
          <p className="data-badge" role="status">
            📌 Showing a pinned data snapshot (live data temporarily unavailable).
          </p>
        )}
      </header>

      <StockPriceChart ticker={data.ticker} onQuoteChange={setStockQuote} />

      <div className="section-grid">
        <NarrativeCard
          title="Business model"
          icon="🏢"
          section={data.businessModel}
          details={
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
          }
        />
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
          metrics={valuationMetrics}
          note={data.valuation?.note}
          demoData={data.valuation?.demoData}
        />
        <NarrativeCard title="Bull case" icon="📈" section={data.bullCase} />
        <NarrativeCard title="Bear case" icon="📉" section={data.bearCase} />
        <AnalystForecastCards
          ticker={data.ticker}
          consensus={data.analystConsensus}
          valuationMetrics={valuationMetrics}
          currentPriceOverride={activeQuote?.price}
          currencyOverride={activeQuote?.currency}
        />
      </div>
    </article>
  );
}

function normalizeQuote(quote) {
  if (quote.currency === 'GBp') {
    return { price: quote.currentPrice / 100, currency: 'GBP' };
  }
  return { price: quote.currentPrice, currency: quote.currency };
}
