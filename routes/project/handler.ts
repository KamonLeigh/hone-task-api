import { eq, and } from "drizzle-orm";
import { db } from "@db/db";
import { selectProjectsSchema, projects } from "@db/schema";
import type { CreateProjectBody } from "@db/schema";
import type { Context } from "hono";
import type { ZodPromise } from "zod";

interface CustomContext extends Context {
  get(key: "user"): { id: string };
  req: Context["req"] & {
    valid<T = CreateProjectBody>(target: "json"): T;
  };
}

export interface NewProjectResponse {
  id: string;
  message?: string;
}

export async function createProjectHandler(c: CustomContext) {
  const { id: ownerId } = c.get("user");
  const { name } = c.req.valid("json");

  const project = await db
    .insert(projects)
    .values({ ownerId, name })
    .returning({
      id: projects.slug,
    });

  const res: NewProjectResponse = {
    id: project[0].id,
  };
  return c.json(res, 201);
}

export async function projectHandeler(c: Context) {
  const { id: ownerId } = c.get("user");
  const { id: slug } = c.req.param();

  const project = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.ownerId, ownerId)));

  if (!project.length) {
    return c.json({ error: "Project not found" }, 200);
  }

  return c.json(
    {
      data: selectProjectsSchema.parse(project[0]),
    },
    200,
  );
}
export async function projectListHandler(c: Context) {
  const { id: ownerId } = c.get("user");

  const projectList = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, ownerId));

  if (!projectList) {
    return c.json(
      {
        error: "Project(s) not found",
      },
      404,
    );
  }

  return c.json(
    {
      data: projectList.map((project) => selectProjectsSchema.parse(project)),
    },
    200,
  );
}

export async function updateProjectHandeler(c: CustomContext) {
  const { id: ownerId } = c.get("user");
  const { id: slug } = c.req.param();
  const { name } = c.req.valid("json");

  try {
    const result = await db
      .update(projects)
      .set({ name })
      .where(and(eq(projects.ownerId, ownerId), eq(projects.slug, slug)));

    if ((result as any)?.rowCount === 0) {
      return c.json({ error: "Failed to update project" }, 404);
    }

    return c.json({ message: "Project updated successfully" }, 200);
  } catch (error) {
    return c.json({ error: "Failed to update project" }, 500);
  }
}

export async function deleteProjectHandeler(c: Context) {
  const { id: ownerId } = c.get("user");
  const { id: slug } = c.req.param();

  const project = await db
    .delete(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.slug, slug)))
    .returning({ id: projects.slug });

  const res: NewProjectResponse = {
    id: project[0].id,
    message: "project removed",
  };
  return c.json(res, 200);
}
