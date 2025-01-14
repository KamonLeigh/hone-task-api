import { eq, and } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "@db/db";
import { selectTasksSchema, tasks, projects } from "@db/schema";
import type { CreateTaskBody } from "@db/schema";

interface CustomContext extends Context {
  get(key: "user"): { id: string };
  req: Context["req"] & {
    valid<T = CreateTaskBody>(target: "json"): T;
  };
}

export interface TaskResponse {
  id: string;
  message?: string;
}

export async function taskListHandler(c: Context) {
  const { id: projectId } = c.req.param();
  const { id: ownerId } = c.get("user");

  const taskList = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.ownerId, ownerId)));

  if (!taskList) {
    return c.json(
      {
        error: "Task(s) not found",
      },
      404,
    );
  }

  return c.json(
    {
      data: taskList.map((task) => selectTasksSchema.parse(task)),
    },
    200,
  );
}

export async function createTaskHandler(c: CustomContext) {
  const { id: projectId } = c.req.param();
  const { id: ownerId } = c.get("user");
  const { name } = c.req.valid("json");

  const project = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, projectId), eq(projects.ownerId, ownerId)));

  if (!project.length) {
    return c.json({ error: "Invalid id: Project not found" }, 404);
  }

  const task = await db
    .insert(tasks)
    .values({ ownerId, projectId, name })
    .returning({
      id: tasks.slug,
    });

  const res: TaskResponse = {
    id: task[0].id,
  };

  return c.json(res, 201);
}

export async function updateTaskHandler(c: CustomContext) {
  const { id: projectId, taskId: slug } = c.req.param();
  const { id: ownerId } = c.get("user");
  const { name } = c.req.valid("json");

  const initialTask = await db
    .select({ ownerId: tasks.ownerId })
    .from(tasks)
    .where(
      and(
        eq(tasks.projectId, projectId),
        eq(tasks.slug, slug),
        eq(tasks.ownerId, ownerId),
      ),
    );

  if (!initialTask.length) {
    return c.json({ error: "Failed to update task: incorrect details" }, 404);
  }

  const task = await db
    .update(tasks)
    .set({ name })
    .where(
      and(
        eq(tasks.ownerId, ownerId),
        eq(tasks.projectId, projectId),
        eq(tasks.slug, slug),
      ),
    );

  if ((task as any)?.rowCount === 0) {
    return c.json({ error: "Failed to update task" }, 404);
  }

  return c.json({ message: "Task successfully updated" }, 200);
}

export async function deleteTaskHandler(c: Context) {
  const { id: ownerId } = c.get("user");
  const { taskId: slug } = c.req.param();

  const initialTask = await db
    .select({ ownerId: tasks.ownerId })
    .from(tasks)
    .where(and(eq(tasks.slug, slug), eq(tasks.ownerId, ownerId)));

  if (!initialTask.length) {
    return c.json({ error: "Failed to update task: incorrect details" }, 404);
  }

  const task = await db
    .delete(tasks)
    .where(and(eq(tasks.ownerId, ownerId), eq(tasks.slug, slug)))
    .returning({ id: tasks.slug });

  const res: TaskResponse = {
    id: task[0].id,
    message: "Task removed",
  };

  return c.json(res, 200);
}
