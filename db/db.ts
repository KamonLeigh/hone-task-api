import * as schema from "./schema";

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import config from "@config";

const sqlite = createClient({
  url: config.DATABASE,
});
export const db = drizzle(sqlite, {
  schema,
});
