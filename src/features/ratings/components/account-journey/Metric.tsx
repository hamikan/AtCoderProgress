export default function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}
