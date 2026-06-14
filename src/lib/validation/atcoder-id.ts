export const ATCODER_ID_VALIDATION_MESSAGE =
  'AtCoder IDは3〜16文字の半角英数字またはアンダースコアで入力してください。';
export const ATCODER_ID_REQUIRED_MESSAGE = 'AtCoder IDを入力してください。';

const ATCODER_ID_PATTERN = /^[A-Za-z0-9_]{3,16}$/;

type AtCoderIdValidationResult =
  | {
      ok: true;
      value: string;
    }
  | {
      error: string;
      ok: false;
    };

export function validateAtCoderId(input: unknown): AtCoderIdValidationResult {
  if (typeof input !== 'string') {
    return {
      error: ATCODER_ID_REQUIRED_MESSAGE,
      ok: false,
    };
  }

  const value = input.trim();

  if (!value) {
    return {
      error: ATCODER_ID_REQUIRED_MESSAGE,
      ok: false,
    };
  }

  if (!ATCODER_ID_PATTERN.test(value)) {
    return {
      error: ATCODER_ID_VALIDATION_MESSAGE,
      ok: false,
    };
  }

  return {
    ok: true,
    value,
  };
}

export function normalizeAtCoderId(input: unknown): string {
  const result = validateAtCoderId(input);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.value;
}
