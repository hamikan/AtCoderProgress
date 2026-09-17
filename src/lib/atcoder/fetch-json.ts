import 'server-only';

import type { z } from 'zod';

const DEFAULT_TIMEOUT_MS = 15_000;

export async function fetchJson<Schema extends z.ZodType>(
  url: string,
  schema: Schema,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<z.output<Schema>> {
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`AtCoder data request failed with status ${response.status}`);
  }

  return schema.parse(await response.json());
}
