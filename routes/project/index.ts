import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";
import authenticate from "@middleware/auth";
import { insertProjectsSchema, selectProjectsSchema } from "@db/schema";
import { StatusCode, type AppEnv } from "@util";
import {
  createProjectHandler,
  deleteProjectHandler,
  projectHandler,
  projectListHandler,
  updateProjectHandler,
} from "./handler";

const projectRoutes = new OpenAPIHono<AppEnv>();

export const paramsId = z.object({
  id: z.string(),
});

export const createProjectRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Project"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: insertProjectsSchema.pick({name: true})}}
    }
  },
  responses: {
    [StatusCode.CREATED]: {
      description: "Project created",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              id: z.string()
            }),
            message: z.string(),
            status: z.number()
          })
        }
      }
    }
  }
})

export const getSingleProjectRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ['Project'],
  security: [{ bearerAuth: [] }],
  request: { params: paramsId },
  responses: {
    [StatusCode.OK]: {
      description: "Project item",
      content: {
        "application/json": {
          schema: z.object({
            data: selectProjectsSchema,
            message: z.string(),
            status: z.number()
          })
        }
      }
    },
    [StatusCode.NOT_FOUND]: {
      description: "Project item",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            status: z.number()
          })
        }
      }
    }
  }
})

export const updateProjectRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ['Project'],
  security: [{ bearerAuth: [] }],
  request: {
    params: paramsId,
    body: {
      content: { "application/json": { schema: z.object({ name: z.string()})}}
    }
  },
  responses: {
    [StatusCode.OK]: {
      description: "Project update",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              id: selectProjectsSchema.shape.slug
            }),
            message: z.string(),
            status: z.number()
          })
        }
      }
    },
    [StatusCode.NOT_FOUND]: {
      description: "Project not found",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            status: z.number()
          })
        }
      }
    }
  }
})

export const getProjectsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Project"],
  security: [{ bearerAuth: [] }],
  responses: {
    [StatusCode.OK]: {
      description: "Project list",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(selectProjectsSchema),
            message: z.string(),
            status: z.number()
          })
        }
      }
    },
  }
})

export const deleteProjectRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ['Project'],
  security: [{ bearerAuth: [] }],
  request: {
    params: paramsId,
  },
  responses: {
    [StatusCode.OK]: {
      description: "Project delete",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              id: selectProjectsSchema.shape.slug
            }),
            message: z.string(),
            status: z.number()
          })
        }
      }
    },
    [StatusCode.NOT_FOUND]: {
      description: "Project not found",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            status: z.number()
          })
        }
      }
    }
  }
})


projectRoutes.use('/', authenticate);
projectRoutes.use(':id', authenticate);

projectRoutes
  .openapi(createProjectRoute, createProjectHandler as any)
  .openapi(getSingleProjectRoute, projectHandler as any)
  .openapi(updateProjectRoute, updateProjectHandler as any)
  .openapi(getProjectsRoute, projectListHandler as any)
  .openapi(deleteProjectRoute, deleteProjectHandler as any)

export default projectRoutes;
