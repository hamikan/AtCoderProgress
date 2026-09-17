export function getRatingHistoryEndpoint(atcoderId: string): string {
  return `https://atcoder.jp/users/${encodeURIComponent(atcoderId)}/history/json`;
}
