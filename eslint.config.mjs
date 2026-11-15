import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
  {
    // ログは src/lib/logger.ts を通して、形と重さをそろえる
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/logger.ts"],
    rules: { "no-console": "error" },
  },
]);

export default eslintConfig;
