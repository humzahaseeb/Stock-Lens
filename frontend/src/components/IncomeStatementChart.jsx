import { useState } from 'react';
import SourceTag from './SourceTag.jsx';

const chart = {
  width: 820,
  height: 320,
  plotLeft: 12,
  plotRight: 760,
  plotTop: 20,
  plotBottom: 264,
};

const series = [
  { key: 'revenue', label: 'Revenue', className: 'income-revenue-bar' },
  { key: 'netIncome', label: 'Net income', className: 'income-net-income-bar' },
];

export default function IncomeStatementChart({ ticker, incomeStatements }) {
  const [period, setPeriod] = useState('annual');
  const statement = incomeStatements?.[period];
  const rows = Array.isArray(statement?.data)
    ? statement.data
        .filter((row) => row && typeof row.date === 'string')
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const values = rows.flatMap((row) => [row.revenue, row.netIncome].filter(isFiniteNumber));

  return (
    <section className="income-statement-card" aria-labelledby="income-statement-heading">
      <div className="income-statement-header">
        <h2 id="income-statement-heading">Income statement</h2>
        <div className="period-switch" role="group" aria-label="Income statement period">
          <button type="button" aria-pressed={period === 'annual'} onClick={() => setPeriod('annual')}>
            Annual
          </button>
          <button type="button" aria-pressed={period === 'quarterly'} onClick={() => setPeriod('quarterly')}>
            Quarterly
          </button>
        </div>
      </div>

      {statement?.demoData && (
        <p className="income-demo-warning" role="status">
          <strong>DEMO DATA:</strong>{' '}
          {statement.demoNote || 'Illustrative only — not actual reported financial results.'}
        </p>
      )}

      <div className="income-legend" role="list" aria-label="Chart series">
        {series.map((item) => (
          <span key={item.key} role="listitem">
            <i className={item.className} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>

      {rows.length > 0 && values.length > 0 ? (
        <IncomeStatementSvg rows={rows} values={values} period={period} ticker={ticker} />
      ) : (
        <p className="income-statement-empty" role="status">
          {statement?.error
            ? `Income statement data is unavailable: ${statement.error}`
            : `No ${period} income statement data is available for ${ticker}.`}
        </p>
      )}

      <SourceTag source={statement?.source} asOf={statement?.asOf} />
    </section>
  );
}

function IncomeStatementSvg({ rows, values, period, ticker }) {
  const actualMin = Math.min(0, ...values);
  const actualMax = Math.max(0, ...values);
  const { min, max, step } = getAxisRange(actualMin, actualMax);
  const plotHeight = chart.plotBottom - chart.plotTop;
  const plotWidth = chart.plotRight - chart.plotLeft;
  const yFor = (value) => chart.plotTop + ((max - value) / (max - min)) * plotHeight;
  const baseline = yFor(0);
  const ticks = [];
  for (let tick = min; tick <= max + step * 0.001; tick += step) {
    ticks.push(Math.abs(tick) < step * 0.001 ? 0 : tick);
  }
  const slotWidth = plotWidth / rows.length;
  const groupWidth = Math.min(112, slotWidth * 0.7);
  const barGap = 5;
  const barWidth = (groupWidth - barGap) / 2;
  const currency = rows.find((row) => row.reportedCurrency)?.reportedCurrency;
  const description = rows
    .map(
      (row) =>
        `${formatPeriod(row, period)} revenue ${formatFullValue(row.revenue, currency)}, net income ${formatFullValue(row.netIncome, currency)}`,
    )
    .join('; ');

  return (
    <>
      {currency && <p className="income-currency-note">Amounts in {currency}</p>}
      <svg
        className="income-statement-svg"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role="img"
        aria-label={`${ticker} ${period} income statement. ${description}`}
      >
        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line
                className={tick === 0 ? 'income-axis-line income-zero-line' : 'income-grid-line'}
                x1={chart.plotLeft}
                x2={chart.plotRight}
                y1={y}
                y2={y}
              />
              <text className="income-axis-label" x={chart.plotRight + 8} y={y + 5}>
                {formatAxisValue(tick)}
              </text>
            </g>
          );
        })}

        {rows.map((row, index) => {
          const center = chart.plotLeft + slotWidth * (index + 0.5);
          const startX = center - groupWidth / 2;
          return (
            <g key={row.date}>
              {series.map((item, seriesIndex) => {
                const value = row[item.key];
                if (!isFiniteNumber(value)) return null;
                const y = yFor(value);
                const barHeight = Math.max(1, Math.abs(baseline - y));
                const barY = Math.min(y, baseline);
                const x = startX + seriesIndex * (barWidth + barGap);
                return (
                  <rect
                    className={item.className}
                    key={item.key}
                    x={x}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="5"
                  >
                    <title>
                      {item.label}: {formatFullValue(value, currency)}
                    </title>
                  </rect>
                );
              })}
              <line
                className="income-x-tick"
                x1={center}
                x2={center}
                y1={chart.plotBottom + 12}
                y2={chart.plotBottom + 17}
              />
              <text className="income-period-label" x={center} y={chart.plotBottom + 38} textAnchor="middle">
                {formatPeriod(row, period)}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function getAxisRange(minimum, maximum) {
  const rawStep = (maximum - minimum) / 4 || 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const factors = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const factor = factors.find((candidate) => candidate >= normalized) || 10;
  const step = factor * magnitude;
  const min = Math.floor(minimum / step) * step;
  const max = Math.max(step, Math.ceil(maximum / step) * step);
  return { min, max, step };
}

function formatAxisValue(value) {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${formatCompact(value / 1e9)}B`;
  if (absolute >= 1e6) return `${formatCompact(value / 1e6)}M`;
  return formatCompact(value);
}

function formatCompact(value) {
  return Number(value.toFixed(1)).toLocaleString('en-US');
}

function formatFullValue(value, currency) {
  if (!isFiniteNumber(value)) return 'unavailable';
  return `${currency ? `${currency} ` : ''}${Math.round(value).toLocaleString('en-US')}`;
}

function formatPeriod(row, period) {
  if (period === 'annual') return String(row.fiscalYear || row.date.slice(0, 4));
  const date = new Date(`${row.date}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return row.period || row.date;
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}
