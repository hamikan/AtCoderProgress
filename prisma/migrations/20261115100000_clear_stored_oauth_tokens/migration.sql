-- ログインにしか使わないプロバイダーのトークンは保存しないことにしたので、すでに保存されている分も消す
UPDATE "accounts" SET "access_token" = NULL, "refresh_token" = NULL, "id_token" = NULL;
