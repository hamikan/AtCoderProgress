import 'server-only';

import type { z } from 'zod';

const DEFAULT_TIMEOUT_MS = 15_000;

export interface FetchJsonOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function fetchJson<Schema extends z.ZodType>(
  url: string,
  schema: Schema,
  options: FetchJsonOptions = {}
): Promise<z.output<Schema>> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const response = await fetch(url, {
    cache: 'no-store',
    signal: signal ? AbortSignal.any([timeoutSignal, signal]) : timeoutSignal,
  });

  if (!response.ok) {
    throw new Error(`AtCoder data request failed with status ${response.status}`);
  }

  return schema.parse(await response.json());
}
