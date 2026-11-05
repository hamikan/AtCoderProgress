import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InProgressSolutionItem } from '@/features/solutions/types';
import { formatProblemDisplayName } from '@/lib/atcoder/problem-name';

interface InProgressRecordsProps {
  records: InProgressSolutionItem[];
}

export default function InProgressRecords({ records }: InProgressRecordsProps) {
  if (records.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          挑戦中
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {records.map((record) => {
            return (
              <Link
                key={record.id}
                href={`/solutions/${record.id}`}
                className="flex items-center gap-3 border-b border-slate-100 px-2 py-2.5 transition-colors last:border-b-0 hover:bg-slate-50"
              >
                <span className="flex-1 truncate font-semibold text-slate-900">
                  {formatProblemDisplayName(
                    record.contestId,
                    record.problemId,
                    record.problemName
                  )}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(record.updatedAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
