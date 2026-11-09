export default function SourceTag({ source, asOf }) {
  if (!source && !asOf) return null;
  const citationUrl = source?.match(/https?:\/\/\S+/)?.[0];
  const sourceLabel = citationUrl ? source.slice(0, source.indexOf(citationUrl)).replace(/[\s—(]+$/, '') : source;

  return (
    <p className="source-tag">
      Source:{' '}
      {citationUrl ? (
        <a href={citationUrl} target="_blank" rel="noreferrer">
          {sourceLabel || citationUrl}
        </a>
      ) : (
        source || 'unknown'
      )}{' '}
      · as of {asOf || 'unknown date'}
    </p>
  );
}
