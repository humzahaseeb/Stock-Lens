import { useEffect, useState } from 'react';
import { fetchStockChart } from '../lib/api.js';

const ranges = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '1mo', label: '1M' },
  { value: '6mo', label: '6M' },
  { value: 'ytd', label: 'YTD' },
  { value: '1y', label: '1Y' },
  { value: '5y', label: '5Y' },
  { value: 'max', label: 'Max' },
];

const chart = { width: 900, height: 330, left: 72, right: 875, top: 24, bottom: 262 };

export default function StockPriceChart({ ticker }) {
  const [range, setRange] = useState('1d');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setChartData(null);
    setError(null);
    setLoading(true);

    fetchStockChart(ticker, range, controller.signal)
      .then((result) => {
        if (active) setChartData(result);
      })
      .catch((requestError) => {
        if (active && requestError.name !== 'AbortError') {
          setError(requestError instanceof Error ? requestError.message : String(requestError));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [ticker, range]);

  const isPositive = (chartData?.change ?? 0) >= 0;

  return (
    <section className="stock-chart-card" aria-labelledby="stock-chart-heading">
      <div className="stock-chart-header">
        <div>
          <h2 id="stock-chart-heading">{ticker} stock price</h2>
          {chartData ? (
            <div className="stock-price-summary">
              <span className="stock-current-price">
                {formatPrice(chartData.currentPrice, chartData.currency)}
              </span>
              {chartData.changePercent !== null && (
                <span className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                  {formatPercent(chartData.changePercent)}
                </span>
              )}
              {chartData.change !== null && (
                <span className={`stock-change-amount ${isPositive ? 'positive' : 'negative'}`}>
                  {formatSignedPrice(chartData.change, chartData.currency)} {rangeLabel(range)}
                </span>
              )}
            </div>
          ) : (
            <p className="stock-price-summary-placeholder">Live market chart</p>
          )}
          {chartData && (
            <p className="stock-chart-as-of">
              As of {formatAsOf(chartData.asOf, chartData.exchangeTimezone)} · {chartData.source}
            </p>
          )}
        </div>
      </div>

      <div className="stock-range-switch" role="group" aria-label="Stock chart time range">
        {ranges.map((item) => (
          <button
            type="button"
            key={item.value}
            aria-pressed={range === item.value}
            onClick={() => setRange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="stock-chart-message stock-chart-error" role="alert">
          {error}
        </p>
      ) : loading || !chartData ? (
        <p className="stock-chart-message" role="status">
          Loading {ticker} market data…
        </p>
      ) : (
        <>
          <StockChartSvg data={chartData} range={range} />
          <div className="stock-chart-stats">
            <StockStat label="Open" value={chartData.open} currency={chartData.currency} />
            <StockStat label="Previous close" value={chartData.previousClose} currency={chartData.currency} />
            <StockStat label="Day high" value={chartData.dayHigh} currency={chartData.currency} />
            <StockStat label="Day low" value={chartData.dayLow} currency={chartData.currency} />
            <StockStat label="52-week high" value={chartData.fiftyTwoWeekHigh} currency={chartData.currency} />
            <StockStat label="52-week low" value={chartData.fiftyTwoWeekLow} currency={chartData.currency} />
          </div>
          <p className="stock-chart-disclaimer">{chartData.delayNote}</p>
        </>
      )}
    </section>
  );
}

function StockChartSvg({ data, range }) {
  const points = data.points;
  const values = points.map((point) => point.close);
  const actualMin = Math.min(...values);
  const actualMax = Math.max(...values);
  const span = actualMax - actualMin || Math.max(Math.abs(actualMax) * 0.02, 1);
  const step = niceStep(span / 4);
  const min = Math.floor((actualMin - span * 0.08) / step) * step;
  const max = Math.ceil((actualMax + span * 0.08) / step) * step;
  const plotWidth = chart.right - chart.left;
  const plotHeight = chart.bottom - chart.top;
  const firstTime = points[0].time;
  const lastTime = points[points.length - 1].time;
  const yFor = (value) => chart.top + ((max - value) / (max - min)) * plotHeight;
  const xFor = (point, index) =>
    lastTime === firstTime
      ? chart.left + (index / Math.max(points.length - 1, 1)) * plotWidth
      : chart.left + ((point.time - firstTime) / (lastTime - firstTime)) * plotWidth;
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(point, index)} ${yFor(point.close)}`)
    .join(' ');
  const areaPath = `${linePath} L ${chart.right} ${chart.bottom} L ${chart.left} ${chart.bottom} Z`;
  const ticks = Array.from({ length: 5 }, (_, index) => min + ((max - min) * index) / 4);
  const labelCount = Math.min(points.length, 6);
  const labelIndexes = Array.from({ length: labelCount }, (_, index) =>
    Math.round((index * (points.length - 1)) / Math.max(labelCount - 1, 1)),
  );
  const direction = (data.change ?? 0) >= 0 ? 'positive' : 'negative';

  return (
    <svg
      className="stock-chart-svg"
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      role="img"
      aria-label={`${data.ticker} ${range} stock price chart, from ${formatPrice(values[0], data.currency)} to ${formatPrice(values[values.length - 1], data.currency)}`}
    >
      <defs>
        <linearGradient id="stock-chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className={`stock-chart-fill-${direction}`} />
          <stop offset="100%" className="stock-chart-fill-transparent" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line className="stock-chart-grid" x1={chart.left} x2={chart.right} y1={y} y2={y} />
            <text className="stock-chart-axis-label" x={chart.left - 10} y={y + 4} textAnchor="end">
              {formatAxisPrice(tick, data.currency)}
            </text>
          </g>
        );
      })}
      {typeof data.previousClose === 'number' && data.previousClose >= min && data.previousClose <= max && (
        <g className="stock-previous-close">
          <line
            x1={chart.left}
            x2={chart.right}
            y1={yFor(data.previousClose)}
            y2={yFor(data.previousClose)}
          />
          <text x={chart.right - 4} y={yFor(data.previousClose) - 7} textAnchor="end">
            Previous close {formatPrice(data.previousClose, data.currency)}
          </text>
        </g>
      )}
      <path d={areaPath} className="stock-chart-area" />
      <path d={linePath} className={`stock-chart-line stock-chart-line-${direction}`} />
      {points.length > 0 && (
        <circle
          className={`stock-chart-current-dot stock-chart-current-dot-${direction}`}
          cx={xFor(points[points.length - 1], points.length - 1)}
          cy={yFor(points[points.length - 1].close)}
          r="4.5"
        />
      )}
      {labelIndexes.map((index) => {
        const point = points[index];
        return (
          <text
            className="stock-chart-time-label"
            key={point.time}
            x={xFor(point, index)}
            y={chart.bottom + 27}
            textAnchor="middle"
          >
            {formatTimeLabel(point.time, range, data.exchangeTimezone)}
          </text>
        );
      })}
    </svg>
  );
}

function StockStat({ label, value, currency }) {
  return (
    <div className="stock-chart-stat">
      <span>{label}</span>
      <strong>{value === null ? 'Unavailable' : formatPrice(value, currency)}</strong>
    </div>
  );
}

function niceStep(value) {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const factor = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((candidate) => candidate >= normalized) || 10;
  return factor * magnitude;
}

function formatPrice(value, currency) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Unavailable';
  const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (currency === 'USD') return `$${formatted}`;
  if (currency === 'GBP') return `£${formatted}`;
  if (currency === 'GBp') return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}p`;
  if (currency === 'EUR') return `€${formatted}`;
  return `${formatted}${currency ? ` ${currency}` : ''}`;
}

function formatAxisPrice(value, currency) {
  if (currency === 'USD') return `$${value.toFixed(2)}`;
  if (currency === 'GBP') return `£${value.toFixed(2)}`;
  if (currency === 'GBp') return `${value.toFixed(0)}p`;
  return value.toFixed(2);
}

function formatSignedPrice(value, currency) {
  const formatted = formatPrice(Math.abs(value), currency);
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function rangeLabel(value) {
  const labels = {
    '1d': 'today',
    '5d': 'past 5 days',
    '1mo': 'past month',
    '6mo': 'past 6 months',
    ytd: 'year to date',
    '1y': 'past year',
    '5y': 'past 5 years',
    max: 'all time',
  };
  return labels[value] || value;
}

function formatAsOf(timestamp, timezone) {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || 'UTC',
    timeZoneName: 'short',
  }).format(date);
}

function formatTimeLabel(timestamp, range, timezone) {
  const options =
    range === '1d' || range === '5d'
      ? { hour: 'numeric', minute: '2-digit' }
      : range === '5y' || range === 'max'
        ? { year: 'numeric' }
        : { month: 'short', year: '2-digit' };
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: timezone || 'UTC' }).format(
    new Date(timestamp * 1000),
  );
}
