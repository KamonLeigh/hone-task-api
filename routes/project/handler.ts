import { eq, and } from "drizzle-orm";
import { db } from "@db/db";
import { selectProjectsSchema, projects } from "@db/schema";
import type { CreateProjectBody } from "@db/schema";
import type { Context } from "hono";
import { StatusCode, successResponse, errorResponse } from "@util";

interface CustomContext extends Context {
  get(key: "user"): { id: string };
  req: Context["req"] & {
    valid<T = CreateProjectBody>(target: "json"): T;
  };
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

  return successResponse(c, {
    data: {
      id: project[0].id
    },
    message: "Project Created",
    status: StatusCode.CREATED
  })
}

export async function projectHandler(c: Context) {
  const { id: ownerId } = c.get("user");
  const { id: slug } = c.req.param();

  const project = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.ownerId, ownerId)));

  if (!project.length) {
    return errorResponse(c, {
      message: "Project not found",
      status: StatusCode.NOT_FOUND
    })
  }

  return successResponse(c, {
    data: selectProjectsSchema.parse(project[0]),
    message: "Project found",
    status: StatusCode.OK
  })
}
export async function projectListHandler(c: Context) {
  const { id: ownerId } = c.get("user");

  const projectList = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, ownerId));

  return successResponse(c, {
    data: projectList.map((project) => selectProjectsSchema.parse(project)),
    message: projectList.length ? "Project List" : "No Project(s) found",
    status: StatusCode.OK
  })
}

export async function updateProjectHandler(c: CustomContext) {
  const { id: ownerId } = c.get("user");
  const { id: slug } = c.req.param();
  const { name } = c.req.valid("json");

    const result = await db
      .update(projects)
      .set({ name })
      .where(and(eq(projects.ownerId, ownerId), eq(projects.slug, slug)));

    if ((result as any)?.changes === 0) {
      return errorResponse(c, {
        message: "Failed to update project",
        status: StatusCode.NOT_FOUND
        })
    }
  return successResponse(c, {
    data: {
      id: slug
    },
    message: "Project updated successfully",
    status: StatusCode.OK
  })
}

export async function deleteProjectHandler(c: Context) {
  const { id: ownerId } = c.get("user");
  const { id: slug } = c.req.param();

  const project = await db
    .delete(projects)
    .where(and(eq(projects.ownerId, ownerId), eq(projects.slug, slug)))
    .returning({ id: projects.slug });

  if (!project.length) {
    return errorResponse(c, {
      message: "Unable to find Project",
      status: StatusCode.NOT_FOUND
    })
  }

  return successResponse(c, {
    data: {
      id: project[0].id,
    },
    message: "Project deleted",
    status: StatusCode.OK
  })
}
