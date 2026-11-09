import SourceTag from './SourceTag.jsx';

const ratingGroups = [
  { key: 'buy', label: 'Buy', color: 'var(--positive)' },
  { key: 'hold', label: 'Hold', color: 'var(--neutral)' },
  { key: 'sell', label: 'Sell', color: 'var(--negative)' },
];

export default function AnalystForecastCards({ ticker, consensus, valuationMetrics }) {
  const breakdown = consensus?.breakdown;
  const counts = breakdown
    ? {
        buy: toCount(breakdown.strongBuy) + toCount(breakdown.buy),
        hold: toCount(breakdown.hold),
        sell: toCount(breakdown.sell) + toCount(breakdown.strongSell),
      }
    : null;
  const ratingTotal = counts ? counts.buy + counts.hold + counts.sell : 0;
  const hasRatings = ratingTotal > 0;
  const priceMetric = Array.isArray(valuationMetrics)
    ? valuationMetrics.find((metric) => metric.label === 'Price')
    : undefined;
  const currentPrice = toNumber(consensus?.currentPrice) ?? toNumber(priceMetric?.value);
  const priceValue = typeof priceMetric?.value === 'string' ? priceMetric.value : '';
  const currency = consensus?.currency || priceValue.match(/[A-Z]{3}/)?.[0];
  const ratingPeriod = consensus?.ratingPeriod;
  const targets = [
    { key: 'high', label: 'Highest', value: toNumber(consensus?.priceTargetHigh) },
    { key: 'average', label: 'Average', value: toNumber(consensus?.priceTarget12m) },
    { key: 'low', label: 'Lowest', value: toNumber(consensus?.priceTargetLow) },
  ];
  const availableTargets = targets.filter((target) => target.value !== null);
  const targetDomain = Math.max(currentPrice ?? 0, ...availableTargets.map((target) => target.value), 0);

  return (
    <div className="analyst-overview">
      {consensus?.demoData && (
        <p className="analyst-demo-warning" role="status">
          <strong>DEMO DATA:</strong>{' '}
          {consensus.demoNote || 'Illustrative only — not actual analyst ratings or forecasts.'}
        </p>
      )}
      <div className="analyst-cards-grid">
        <section className="analyst-card" aria-labelledby="analyst-ratings-heading">
          <h2 id="analyst-ratings-heading">Analyst ratings</h2>
          <p className="analyst-card-description">
            {hasRatings
              ? `Based on ${ratingTotal} analysts giving stock ratings to ${ticker}${
                  ratingPeriod ? ` in the ${ratingPeriod}` : consensus?.asOf ? ` for ${consensus.asOf}` : ' in the latest reported period'
                }.`
              : 'Analyst rating breakdown is unavailable for this company.'}
          </p>

          {hasRatings ? (
            <>
              <div className="ratings-visual">
                <div
                  className="rating-donut"
                  role="img"
                  aria-label={`Analyst ratings: ${counts.buy} buy, ${counts.hold} hold, ${counts.sell} sell`}
                  style={{ background: createDonutGradient(counts, ratingTotal) }}
                />
                <ul className="rating-legend">
                  {ratingGroups.map(({ key, label, color }) => (
                    <li key={key}>
                      <span className="rating-legend-label">
                        <span className="rating-legend-swatch" style={{ backgroundColor: color }} />
                        {label}
                      </span>
                      <span>{counts[key]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {consensus?.rating && <p className="consensus-rating">{consensus.rating}</p>}
            </>
          ) : (
            <p className="analyst-empty-state" role="status">
              {consensus?.researchNote || 'No live analyst rating counts are available from the current data source.'}
            </p>
          )}

          <SourceTag source={consensus?.source} asOf={consensus?.asOf} />
        </section>

        <section className="analyst-card" aria-labelledby="forecast-heading">
          <h2 id="forecast-heading">12-month forecast</h2>
          <p className="analyst-card-description">
            {consensus?.priceTargetAnalystCount
              ? `Based on ${consensus.priceTargetAnalystCount} Wall Street analysts offering 12-month price targets for ${ticker}${
                  consensus.priceTargetPeriod ? ` in the ${consensus.priceTargetPeriod}` : ''
                }.`
              : `Analyst price targets for ${ticker} over the next 12 months.`}
          </p>

          <div className="forecast-chart">
            {availableTargets.length > 0 && currentPrice !== null && targetDomain > 0 && (
              <div className="forecast-marker-area">
                <span
                  className="forecast-current-marker"
                  style={{ left: `${Math.min(100, (currentPrice / targetDomain) * 100)}%` }}
                  aria-hidden="true"
                />
              </div>
            )}
            {targets.map(({ key, label, value }) => (
              <div className="forecast-row" key={key}>
                <span className="forecast-row-label">{label}</span>
                {value === null ? (
                  <span className="forecast-value-unavailable">Unavailable</span>
                ) : (
                  <div className="forecast-track">
                    <div
                      className="forecast-bar"
                      style={{ width: `${Math.max(1, (value / targetDomain) * 100)}%` }}
                    >
                      <span>{formatPrice(value, currency)}</span>
                      {currentPrice !== null && <small>{formatUpside(value, currentPrice)}</small>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {availableTargets.length === 0 && (
            <p className="analyst-empty-state forecast-empty-note" role="status">
              {consensus?.priceTargetNote ||
                consensus?.researchNote ||
                '12-month analyst price targets are not available from the current data source.'}
            </p>
          )}

          <p className="forecast-current-price">
            Current {currentPrice !== null ? formatPrice(currentPrice, currency) : priceMetric?.value || 'Unavailable'}
          </p>
          {availableTargets.length > 0 && (
            <SourceTag source={consensus?.priceTargetSource} asOf={consensus?.priceTargetAsOf} />
          )}
        </section>
      </div>
    </div>
  );
}

function toCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== 'string') return null;
  const match = value.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function createDonutGradient(counts, total) {
  const buyEnd = (counts.buy / total) * 360;
  const holdEnd = buyEnd + (counts.hold / total) * 360;
  return `conic-gradient(var(--positive) 0deg ${buyEnd}deg, var(--neutral) ${buyEnd}deg ${holdEnd}deg, var(--negative) ${holdEnd}deg 360deg)`;
}

function formatPrice(value, currency) {
  const formatted = value.toFixed(2);
  const symbol = { USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$' }[currency];
  return symbol ? `${symbol}${formatted}` : `${formatted}${currency ? ` ${currency}` : ''}`;
}

function formatUpside(target, current) {
  if (current <= 0) return '';
  const percentage = ((target / current - 1) * 100).toFixed(2);
  return `(${Number(percentage) > 0 ? '+' : ''}${percentage}%)`;
}
