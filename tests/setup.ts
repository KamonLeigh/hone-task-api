import { beforeAll, afterAll } from "bun:test";
import { users, comments, tasks, projects } from "@db/schema";
import { generateHash } from "@util";
import { db } from "@db/db";
beforeAll(async () => {
  try {
    console.log("\x1b[38;5;214m%s\x1b[0m", "Setting up test environment");
    const { salt, hash } = await generateHash("password1234");
    const userOne = await db
      .insert(users)
      .values({ name: "leigh", salt, hash });
    console.log(userOne);
    const userTwo = await db
      .insert(users)
      .values({ name: "peter", salt, hash });
  } catch (error) {
    console.error("Setup error:", error);
  }
});

afterAll(async () => {
  try {
    await db.delete(comments);
    await db.delete(tasks);
    await db.delete(projects);
    await db.delete(users);

    console.log("\x1b[38;5;214m%s\x1b[0m", "Cleaning up test environment");
  } catch (error) {
    console.error("Cleanup error:", error);
  }
});
