import { Skeleton } from '@/components/ui/skeleton';

export default function MainLoading() {
  return (
    <div role="status" className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <span className="sr-only">読み込み中</span>
    </div>
  );
}
