import { config as loadEnv } from 'dotenv';

// アプリ（Next.js）と同じく .env.local を先に読む。すでにある値は上書きしない
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });
