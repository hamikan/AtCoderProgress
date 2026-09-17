import { z } from 'zod';

export const ATCODER_ID_VALIDATION_MESSAGE =
  'AtCoder IDは3〜16文字の半角英数字またはアンダースコアで入力してください。';
export const ATCODER_ID_REQUIRED_MESSAGE = 'AtCoder IDを入力してください。';

export const atcoderIdSchema = z
  .string({ error: ATCODER_ID_REQUIRED_MESSAGE })
  .trim()
  .min(1, ATCODER_ID_REQUIRED_MESSAGE)
  .regex(/^[A-Za-z0-9_]{3,16}$/, ATCODER_ID_VALIDATION_MESSAGE);

export function parseAtCoderId(input: unknown): string {
  const result = atcoderIdSchema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? ATCODER_ID_VALIDATION_MESSAGE);
  }
  return result.data;
}
