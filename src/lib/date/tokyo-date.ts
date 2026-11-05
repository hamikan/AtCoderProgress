// 日本時間は夏時間がなく常に UTC+9 なので、固定の差で計算できる
const TOKYO_OFFSET_SECONDS = 9 * 60 * 60;

export interface TokyoDateParts {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

const tokyoPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getTokyoDateParts(date: Date): TokyoDateParts {
  const values = new Map(
    tokyoPartsFormatter
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.get('year')),
    month: Number(values.get('month')),
    day: Number(values.get('day')),
  };
}

export function formatTokyoDateParts(parts: TokyoDateParts): string {
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${parts.year}-${month}-${day}`;
}

export function formatTokyoDate(date: Date): string {
  return formatTokyoDateParts(getTokyoDateParts(date));
}

export function shiftTokyoDateParts(
  parts: TokyoDateParts,
  days: number
): TokyoDateParts {
  const shifted = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + days)
  );

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function getTokyoDateStartEpochSecond(parts: TokyoDateParts): number {
  return (
    Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 1000) -
    TOKYO_OFFSET_SECONDS
  );
}

export function getTokyoMonthStartEpochSecond(
  date: Date,
  monthOffset = 0
): number {
  const { year, month } = getTokyoDateParts(date);
  const firstOfMonth = new Date(Date.UTC(year, month - 1 + monthOffset, 1));

  return Math.floor(firstOfMonth.getTime() / 1000) - TOKYO_OFFSET_SECONDS;
}
