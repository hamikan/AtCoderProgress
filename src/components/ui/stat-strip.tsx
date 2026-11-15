export interface StatStripItem {
  label: string;
  value: string;
  /** 数字の右に小さく添える補足。「・」で区切って並べる */
  notes?: string[];
}

interface StatStripProps {
  items: StatStripItem[];
}

export function StatStrip({ items }: StatStripProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 xl:flex xl:flex-wrap xl:gap-x-0 xl:divide-x xl:divide-slate-200">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-wrap items-baseline gap-x-2 xl:px-5 xl:first:pl-0 xl:last:pr-0"
        >
          <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
          <dd className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-bold tabular-nums text-slate-900">{item.value}</span>
            {item.notes && item.notes.length > 0 && (
              <span className="text-xs text-slate-500">{item.notes.join(' ・ ')}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
