import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import config from "@config";

const sqlite = new Database(config.DATABASE);
const db = drizzle(sqlite);
await migrate(db, { migrationsFolder: "./drizzle" });
