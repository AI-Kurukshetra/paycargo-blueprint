type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps): JSX.Element {
  return (
    <article className="surface p-5">
      <p className="section-title">{label}</p>
      <p className="mt-4 font-[var(--font-serif)] text-4xl text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </article>
  );
}
