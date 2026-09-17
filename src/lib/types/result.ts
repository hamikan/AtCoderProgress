/** Expected outcomes of a client-callable mutation. Never expose raw exceptions. */
export type Result<Value, Error> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly error: Error };
