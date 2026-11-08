import { getDifficultyCircleStyle } from '@/lib/atcoder/difficulty';
import { cn } from '@/lib/utils';

interface DifficultyCircleProps {
  difficulty: number;
  className?: string;
}

export default function DifficultyCircle({ difficulty, className }: DifficultyCircleProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-3 shrink-0 rounded-full border', className)}
      style={getDifficultyCircleStyle(difficulty)}
    />
  );
}
