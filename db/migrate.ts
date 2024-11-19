// import { migrate } from "drizzle-orm/bun-sqlite/migrator";

// // import { drizzle } from "drizzle-orm/bun-sqlite";
// // import { Database } from "bun:sqlite";

// // const sqlite = new Database("sqlite.db");
// // const db = drizzle(sqlite);
// import { drizzle } from "drizzle-orm/libsql";
// import { createClient } from "@libsql/client";
// import * as schema from "./schema";
// import config from "@config";
// const client = createClient({
//   url: config.DATABASE_URL,
//   authToken: config.DATABASE_AUTH_TOKEN,
// });

// const db = drizzle(client, {
//   schema,
// });
// await migrate(db, { migrationsFolder: "./drizzle" });

import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);
await migrate(db, { migrationsFolder: "./drizzle" });
