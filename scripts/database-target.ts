export function describeDatabaseTarget(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return 'DATABASE_URL が未設定です';
  }
  try {
    const parsed = new URL(databaseUrl);
    const database = parsed.pathname.replace(/^\//, '');
    return `${parsed.hostname}:${parsed.port || '5432'} / ${database}`;
  } catch {
    return 'DATABASE_URL の形式を解釈できませんでした';
  }
}
