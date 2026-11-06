import 'server-only';

// 連携は全件取得で時間がかかるので、二度押しなどで同じユーザーの連携が同時に走らないようにする（同じプロセスの中だけ）
const linkAttemptsInFlight = new Set<string>();

export function tryBeginLinkAttempt(userId: string): boolean {
  if (linkAttemptsInFlight.has(userId)) {
    return false;
  }
  linkAttemptsInFlight.add(userId);
  return true;
}

export function endLinkAttempt(userId: string): void {
  linkAttemptsInFlight.delete(userId);
}
