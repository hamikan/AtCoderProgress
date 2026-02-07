import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDifficultyColor = (difficulty: number | null) => {
  if (difficulty === null) return 'text-[#808080]';
  if (difficulty < 400) return 'text-[#808080]';
  if (difficulty < 800) return 'text-[#804000]';
  if (difficulty < 1200) return 'text-[#008000]';
  if (difficulty < 1600) return 'text-[#00C0C0]';
  if (difficulty < 2000) return 'text-[#0000FF]';
  if (difficulty < 2400) return 'text-[#C0C000]';
  if (difficulty < 2800) return 'text-[#FF8000]';
  return 'text-[#FF0000]';
};
