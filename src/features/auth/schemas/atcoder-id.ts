import {
  ATCODER_ID_REQUIRED_MESSAGE,
  ATCODER_ID_VALIDATION_MESSAGE,
  atcoderIdSchema,
  parseAtCoderId,
} from '@/lib/atcoder/user-id';

type AtCoderIdValidationResult =
  | { ok: true; value: string }
  | { error: string; ok: false };

export {
  ATCODER_ID_REQUIRED_MESSAGE,
  ATCODER_ID_VALIDATION_MESSAGE,
  atcoderIdSchema,
  parseAtCoderId,
};

export function validateAtCoderId(input: unknown): AtCoderIdValidationResult {
  const result = atcoderIdSchema.safeParse(input);
  if (result.success) {
    return { ok: true, value: result.data };
  }

  return {
    error: result.error.issues[0]?.message ?? ATCODER_ID_VALIDATION_MESSAGE,
    ok: false,
  };
}
