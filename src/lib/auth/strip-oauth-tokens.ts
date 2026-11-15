const OAUTH_TOKEN_FIELDS: ReadonlySet<string> = new Set([
  'access_token',
  'refresh_token',
  'id_token',
]);

// トークンはログインの最中にしか使わない。保存しておくと、DB やバックアップが漏れたときに、そのまま使える鍵を渡すことになる
export function stripOAuthTokens<Account extends Record<string, unknown>>(
  account: Account
): Account {
  return Object.fromEntries(
    Object.entries(account).filter(([field]) => !OAUTH_TOKEN_FIELDS.has(field))
  ) as Account;
}
