import * as schema from "./schema";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import config from "@config";

const sqlite = new Database(config.DATABASE);
export const db = drizzle(sqlite, {
  schema,
});
