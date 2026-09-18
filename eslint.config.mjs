import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local-only, gitignored copies of the project — git worktrees, the
    // sftp upload staging folder, build output and DB backups. Linting them
    // reported ~800 errors from stale duplicates of src/, none of them real.
    ".claude/**",
    "deploy/**",
    "dist/**",
    "backups/**",
  ]),
  {
    // The cPanel/Passenger startup file. CommonJS on purpose — Passenger
    // require()s it and package.json declares no "type": "module".
    files: ["server.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
