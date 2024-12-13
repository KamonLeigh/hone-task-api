import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "bun",
    exclude: ["**/node_modules/**", "**/dist/**"],
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.ts", "**/*.test.js"],
  },
});
