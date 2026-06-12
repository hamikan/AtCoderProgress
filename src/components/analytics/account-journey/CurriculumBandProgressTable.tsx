import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CurriculumProblemProgress,
  CurriculumSectionProgress,
  RatingBandDefinition,
} from '@/lib/services/db/stats';

interface CurriculumBandProgressTableProps {
  sections: CurriculumSectionProgress[];
  selectedBand: RatingBandDefinition;
}

interface CurriculumProgressCount {
  total: number;
  solvedBefore: number;
  solvedInBand: number;
  cumulativeSolved: number;
}

type CurriculumProgressRow = CurriculumProgressCount & {
  key: string;
  label: string;
};

const ALPHABET_GRID_SECTION_KEYS = new Set(['edpc-core', 'tdpc', 'ndpc']);

export default function CurriculumBandProgressTable({
  sections,
  selectedBand,
}: CurriculumBandProgressTableProps) {
  if (sections.length === 0) return null;

  return (
    <section className="mt-4 rounded-lg border border-white/80 bg-white/70 p-3">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <BookOpen className="h-4 w-4 text-slate-600" />
          教材セット到達度
        </span>
        <span className="text-xs text-slate-500">
          累積は選択色まで / 色付き部分はこの色で初AC
        </span>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <CurriculumSectionTable
            key={section.key}
            section={section}
            selectedBand={selectedBand}
          />
        ))}
      </div>
    </section>
  );
}

function CurriculumSectionTable({
  section,
  selectedBand,
}: {
  section: CurriculumSectionProgress;
  selectedBand: RatingBandDefinition;
}) {
  const sectionCount = countProblemsByBand(section.problems, selectedBand);
  const rows = section.groups
    .map((group) => ({
      key: group.key,
      label: group.label,
      ...countProblemsByBand(group.problems, selectedBand),
    }))
    .filter((row) => row.total > 0);

  if (ALPHABET_GRID_SECTION_KEYS.has(section.key)) {
    return (
      <AlphabetProgressGrid
        section={section}
        rows={rows}
        sectionCount={sectionCount}
        selectedBand={selectedBand}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <SectionHeader
        section={section}
        sectionCount={sectionCount}
        selectedBand={selectedBand}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">分類</th>
              <th className="px-3 py-2 text-left font-medium">累積AC</th>
              <th className="px-3 py-2 text-left font-medium">この色でAC</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-800">{row.label}</td>
                <td className="px-3 py-2 text-slate-700">
                  {row.cumulativeSolved.toLocaleString()}/{row.total.toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex min-w-36 items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex min-w-10 justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
                        row.solvedInBand > 0
                          ? `${selectedBand.bgColor} ${selectedBand.textColor}`
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {row.solvedInBand.toLocaleString()}問
                    </span>
                    <SplitProgressBar count={row} selectedBand={selectedBand} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlphabetProgressGrid({
  section,
  rows,
  sectionCount,
  selectedBand,
}: {
  section: CurriculumSectionProgress;
  rows: CurriculumProgressRow[];
  sectionCount: CurriculumProgressCount;
  selectedBand: RatingBandDefinition;
}) {
  const gridTemplateColumns = `repeat(${rows.length}, minmax(1.5rem, 1fr))`;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <SectionHeader
        section={section}
        sectionCount={sectionCount}
        selectedBand={selectedBand}
      />

      <div className="overflow-x-auto px-3 py-4">
        <div
          className="grid min-w-[620px] gap-x-1 gap-y-2"
          style={{ gridTemplateColumns }}
        >
          {rows.map((row) => (
            <div
              key={`${row.key}-label`}
              className="text-center text-xs font-semibold text-slate-500"
            >
              {formatAlphabetGridLabel(row.label)}
            </div>
          ))}

          {rows.map((row) => (
            <div
              key={`${row.key}-cell`}
              className={cn(
                'mx-auto h-5 w-5 rounded-[3px] border transition-colors',
                getAlphabetGridCellClass(row, selectedBand)
              )}
              role="img"
              aria-label={`${formatAlphabetGridLabel(row.label)}: ${
                row.cumulativeSolved > 0 ? 'AC済み' : '未AC'
              }${row.solvedInBand > 0 ? '、この色でAC' : ''}`}
              title={`${formatAlphabetGridLabel(row.label)}: ${
                row.cumulativeSolved > 0 ? 'AC済み' : '未AC'
              }${row.solvedInBand > 0 ? ' / この色でAC' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  section,
  sectionCount,
  selectedBand,
}: {
  section: CurriculumSectionProgress;
  sectionCount: CurriculumProgressCount;
  selectedBand: RatingBandDefinition;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <h4 className="text-sm font-semibold text-slate-950">{section.title}</h4>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-950">
          {sectionCount.cumulativeSolved.toLocaleString()}/{sectionCount.total.toLocaleString()}
        </span>
        {sectionCount.solvedInBand > 0 && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              selectedBand.bgColor,
              selectedBand.textColor
            )}
          >
            +{sectionCount.solvedInBand.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

function SplitProgressBar({
  count,
  selectedBand,
}: {
  count: CurriculumProgressCount;
  selectedBand: RatingBandDefinition;
}) {
  const beforeWidth = toWidth(count.solvedBefore, count.total);
  const selectedWidth = toWidth(count.solvedInBand, count.total);

  return (
    <div className="flex h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div className="bg-slate-400" style={{ width: `${beforeWidth}%` }} />
      <div className={selectedBand.barColor} style={{ width: `${selectedWidth}%` }} />
    </div>
  );
}

function countProblemsByBand(
  problems: CurriculumProblemProgress[],
  selectedBand: RatingBandDefinition
): CurriculumProgressCount {
  const solvedBefore = problems.filter(
    (problem) => problem.solvedBand && problem.solvedBand.min < selectedBand.min
  ).length;
  const solvedInBand = problems.filter(
    (problem) => problem.solvedBand?.key === selectedBand.key
  ).length;
  const cumulativeSolved = solvedBefore + solvedInBand;

  return {
    total: problems.length,
    solvedBefore,
    solvedInBand,
    cumulativeSolved,
  };
}

function toWidth(value: number, total: number) {
  if (total === 0 || value === 0) return 0;

  return Math.max(2, (value / total) * 100);
}

function formatAlphabetGridLabel(label: string) {
  return label.replace(/問題$/, '');
}

function getAlphabetGridCellClass(
  count: CurriculumProgressCount,
  selectedBand: RatingBandDefinition
) {
  if (count.solvedInBand > 0) {
    return `${selectedBand.borderColor} ${selectedBand.barColor}`;
  }
  if (count.cumulativeSolved > 0) {
    return 'border-slate-400 bg-slate-400';
  }

  return 'border-slate-200 bg-slate-50';
}
