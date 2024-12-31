import { beforeAll, afterAll } from "bun:test";
import { users, comments, tasks, projects } from "@db/schema";
import { eq } from "drizzle-orm";
import app from "@app";
import {
  createTestRequest,
  generateTokenUser,
  clearDatabaseData,
} from "./util-test";
import { generateHash } from "@util";
import {
  projectsList,
  taskListUserOne,
  commentsListUserOne,
  PASSWORD,
} from "./data";
import { db } from "@db/db";

const checkCode = async () => {
  console.log("\x1b[38;5;214m%s\x1b[0m", "Checking code in test file...");
  try {
    if (!users || !comments || !tasks || !projects) {
      throw new Error("Database schema not properly imported");
    }
    if (!app) {
      throw new Error("App not properly imported");
    }
    if (!db) {
      throw new Error("Database connection not initialized");
    }
  } catch (error) {
    console.error("Code check failed:", error);
    process.exit(1);
  }
};

checkCode();
beforeAll(async () => {
  try {
    console.log("\x1b[38;5;214m%s\x1b[0m", "Setting up test environment");
    await clearDatabaseData();
    const { salt, hash } = await generateHash(PASSWORD);
    await db.insert(users).values({ name: "leigh", salt, hash });

    const tokenUserOne = await generateTokenUser({
      name: "leigh",
      password: PASSWORD,
    });

    const headers = {
      Authorization: `Bearer ${tokenUserOne.token}`,
    };
    const req = createTestRequest("/user/me", {
      method: "GET",
      headers,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    // Add projects to user one
    projectsList.one.forEach(async (name: string) => {
      await db.insert(projects).values({ ownerId: data.user.id, name });
    });

    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, data.user.id));

    // Add tasks to projects

    projectList.forEach((list, index) => {
      const newIndex: string = (index + 1).toString();
      taskListUserOne[newIndex]?.forEach(async (name: string) => {
        const id = await db
          .insert(tasks)
          .values({
            ownerId: data.user.id,
            projectId: list.slug,
            name,
          })
          .returning({ id: tasks.slug });
        const taskId = id[0].id;

        commentsListUserOne[newIndex]?.forEach(async (comment: string) => {
          await db.insert(comments).values({
            comment,
            taskId,
            authorId: data.user.id,
          });
        });
      });
    });

    await db.insert(users).values({ name: "peter", salt, hash });
  } catch (error) {
    console.error("Setup error:", error);
  }
});

afterAll(async () => {
  try {
    await clearDatabaseData();
    console.log("\x1b[38;5;214m%s\x1b[0m", "Cleaning up test environment");
  } catch (error) {
    console.error("Cleanup error:", error);
  }
});
