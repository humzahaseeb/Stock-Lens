export default function SourceTag({ source, asOf }) {
  if (!source && !asOf) return null;
  return (
    <p className="source-tag">
      Source: {source || 'unknown'} · as of {asOf || 'unknown date'}
    </p>
  );
}
