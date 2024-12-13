import { beforeAll } from "vitest";
import { applyMigration } from "../db/migrate";

beforeAll(async () => {
  console.log("test");
  await applyMigration();
});
