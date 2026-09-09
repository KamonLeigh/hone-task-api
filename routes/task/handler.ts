import { eq, and } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "@db/db";
import { successResponse, errorResponse, StatusCode } from "@util";
import { selectTasksSchema, tasks, projects } from "@db/schema";
import type { CreateTaskBody } from "@db/schema";


interface CustomContext extends Context {
  get(key: "user"): { id: string };
  req: Context["req"] & {
    valid<T = CreateTaskBody>(target: "json"): T;
  };
}
export async function taskListHandler(c: Context) {
  const { id: projectId } = c.req.param();
  const { id: ownerId } = c.get("user");

  const taskList = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.ownerId, ownerId)));

  if (!taskList.length) {
    return errorResponse(c, {
      message: "Task(s) not found",
      status: StatusCode.NOT_FOUND
    })
  }

  return successResponse(c, {
    data: taskList.map((task) => selectTasksSchema.parse(task)),
    message: "Tasks List",
    status: StatusCode.OK
  })
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
    return errorResponse(c, {
      message: "Invalid id: Project not found",
      status: StatusCode.NOT_FOUND
    })
  }

  const task = await db
    .insert(tasks)
    .values({ ownerId, projectId, name })
    .returning({
      id: tasks.slug,
    });

  return successResponse(c, {
    data: {
      id : task[0].id,
    },
    message: "Task created",
    status: StatusCode.CREATED
  })
}

export async function updateTaskHandler(c: CustomContext) {
  const { id: projectId, taskId: slug } = c.req.param();
  const { id: ownerId } = c.get("user");
  const { name } = c.req.valid("json");

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

  if ((task as any)?.changes === 0) {
      return errorResponse(c, {
        message: "Failed to update Task",
        status: StatusCode.NOT_FOUND
      })
  }
  return successResponse(c, {
    data: {
      id: slug
    },
    message: "Task successfully updated",
    status: StatusCode.OK
  })
}

export async function deleteTaskHandler(c: Context) {
  const { id: ownerId } = c.get("user");
  const { taskId: slug } = c.req.param();

  const initialTask = await db
    .select({ ownerId: tasks.ownerId })
    .from(tasks)
    .where(and(eq(tasks.slug, slug), eq(tasks.ownerId, ownerId)));

  if (!initialTask.length) {
    return errorResponse(c, {
      message: "Failed to update Task: incorrect details",
      status: StatusCode.NOT_FOUND
    })
  }

  const task = await db
    .delete(tasks)
    .where(and(eq(tasks.ownerId, ownerId), eq(tasks.slug, slug)))
    .returning({ id: tasks.slug });

  return successResponse(c, {
    data: {
      id: task[0].id,
    },
    message: "Task deleted",
    status: StatusCode.OK
  })
}
