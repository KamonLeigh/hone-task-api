import { migrate } from "drizzle-orm/libsql/migrator";

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import config from "../config";

// const sqlite = new Database(config.DATABASE);
const client = createClient({
  url: config.DATABASE,
});
const db = drizzle(client);
await migrate(db, { migrationsFolder: "./drizzle" });

export async function applyMigration(): Promise<void> {
  console.log("running");
  //await migrate(db, { migrationsFolder: "./drizzle" });
}
