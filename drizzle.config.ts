import { defineConfig } from "drizzle-kit";
import config from "@config"; // Check if DATABASE_URL exists in config

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: config.DATABASE,
  },
});
