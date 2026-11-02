/**
 * Date helpers pinned to Asia/Tokyo.
 *
 * The app aggregates submissions and ratings by calendar day and month
 * for users in Japan. Using the server's timezone instead shifts every
 * boundary by the offset (9 hours on a UTC server), so all day/month
 * boundaries must go through these helpers (issue #115). JST is UTC+9
 * all year (no daylight saving), which makes the offset arithmetic
 * exact.
 */

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

/** The calendar date that `date` falls on in Asia/Tokyo. */
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

/** Formats date parts as `yyyy-MM-dd`. */
export function formatTokyoDateParts(parts: TokyoDateParts): string {
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${parts.year}-${month}-${day}`;
}

/** The `yyyy-MM-dd` calendar date of `date` in Asia/Tokyo. */
export function formatTokyoDate(date: Date): string {
  return formatTokyoDateParts(getTokyoDateParts(date));
}

/** Shifts date parts by a number of calendar days. */
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

/** Epoch seconds of 00:00 Asia/Tokyo on the given date. */
export function getTokyoDateStartEpochSecond(parts: TokyoDateParts): number {
  return (
    Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 1000) -
    TOKYO_OFFSET_SECONDS
  );
}

/**
 * Epoch seconds of the start (00:00 Asia/Tokyo) of the month that
 * contains `date`, shifted by `monthOffset` months.
 */
export function getTokyoMonthStartEpochSecond(
  date: Date,
  monthOffset = 0
): number {
  const { year, month } = getTokyoDateParts(date);
  const firstOfMonth = new Date(Date.UTC(year, month - 1 + monthOffset, 1));

  return Math.floor(firstOfMonth.getTime() / 1000) - TOKYO_OFFSET_SECONDS;
}
