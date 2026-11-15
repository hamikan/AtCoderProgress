const MAX_ERROR_MESSAGE_LENGTH = 2000;

type LogContext = Record<string, unknown>;

function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    const code = (value as { code?: unknown }).code;
    return {
      name: value.name,
      // Prisma のエラーは入力した値まで載せることがあるので、長さを切る
      message: value.message.slice(0, MAX_ERROR_MESSAGE_LENGTH),
      ...(typeof code === 'string' ? { code } : {}),
      ...(value.stack ? { stack: value.stack } : {}),
    };
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

// Vercel のログは 1 行ずつ検索するので、文脈は改行のない JSON にして同じ行に載せる
export function formatLogLine(scope: string, message: string, context?: LogContext): string {
  const head = `[${scope}] ${message}`;
  if (!context || Object.keys(context).length === 0) {
    return head;
  }
  return `${head} ${JSON.stringify(context, (_key, value) => serializeValue(value))}`;
}

/**
 * ログの出し方をそろえるための入口。scope は処理の名前（例: atcoder-refresh）。
 *
 * - info: 普段の記録（取り込みの結果など）
 * - warn: 失敗したが、あとで取り直せば済むもの
 * - error: 利用者の操作が失敗した、またはデータが失われうるもの
 *
 * context には ID や件数を入れる。トークン、メールアドレス、解法の本文は入れない。
 */
export function createLogger(scope: string) {
  return {
    info(message: string, context?: LogContext): void {
      console.log(formatLogLine(scope, message, context));
    },
    warn(message: string, context?: LogContext): void {
      console.warn(formatLogLine(scope, message, context));
    },
    error(message: string, context?: LogContext): void {
      console.error(formatLogLine(scope, message, context));
    },
  };
}
