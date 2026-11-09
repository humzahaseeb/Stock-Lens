import SourceTag from './SourceTag.jsx';

/** Renders a narrative section (summary text or a list of points). Shows a
 * clear "needs research" placeholder instead of pretending to have real
 * data when a field hasn't been manually researched yet. */
export default function NarrativeCard({ title, section }) {
  if (!section) {
    return (
      <section className="summary-section" aria-labelledby={`${title}-heading`}>
        <h2 id={`${title}-heading`}>{title}</h2>
        <p className="empty-state">Not available for this company.</p>
      </section>
    );
  }

  if (section.needsResearch) {
    return (
      <section className="summary-section needs-research" aria-labelledby={`${title}-heading`}>
        <h2 id={`${title}-heading`}>{title}</h2>
        <p className="research-flag" role="status">
          ⚠ Research needed: {section.researchNote}
        </p>
      </section>
    );
  }

  return (
    <section className="summary-section" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>{title}</h2>
      {section.summary && <p>{section.summary}</p>}
      {Array.isArray(section.points) && (
        <ul>
          {section.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      {section.rating && (
        <p>
          <strong>Rating:</strong> {section.rating} &nbsp;
          <strong>12-month price target:</strong> {section.priceTarget12m} {section.currency}
        </p>
      )}
      <SourceTag source={section.source} asOf={section.asOf} />
    </section>
  );
}
