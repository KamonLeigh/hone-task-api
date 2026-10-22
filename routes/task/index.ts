import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import authenticate from "@middleware/auth";
import { paramsId } from "../project";
import { insertTasksSchema, selectTasksSchema } from "@db/schema";
import { StatusCode, type AppEnv } from "@util";
import {
  taskListHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from "./handler";

const taskRoutes = new OpenAPIHono<AppEnv>();

const paramsTaskId = paramsId.extend({
  taskId: z.string(),
});


export const getTasksRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ['Tasks'],
  security: [{ bearerAuth: [] }],
  request: { params: paramsId },
  responses: {
    [StatusCode.OK]: {
      description: "Tasks for project",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(selectTasksSchema),
            message: z.string(),
            status: z.number()
          })
        }
      }
    },
    [StatusCode.NOT_FOUND]: {
      description: "Task(s) not found",
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


export const insertTaskRoute = createRoute({
  method: "post",
  path: "/{id}",
  security: [{ bearerAuth: [] }],
  request: {
    params: paramsId,
    body: {
      content: {
        "application/json": {
          schema: z.object({ name: z.string()})
        }
      }
    }
  },
  responses: {
    [StatusCode.CREATED]: {
      description: "Task update",
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
    },
    [StatusCode.NOT_FOUND]: {
      description: "Task not found",
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



export const updateTaskRoute = createRoute({
  method: "patch",
  path: "/{id}/{taskId}",
  security: [{ bearerAuth: [] }],
  request: {
    params: paramsTaskId,
    body: {
      content: {
        "application/json": {
          schema: z.object({ name: z.string()})
        }
      }
    }
  },
  responses: {
    [StatusCode.OK]: {
      description: "Task update",
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
    },
    [StatusCode.NOT_FOUND]: {
      description: "Task not found",
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


export const deleteTaskRoute = createRoute({
  method: "delete",
  path: "/{id}/{taskId}",
  security: [{ bearerAuth: [] }],
  request: {
    params: paramsTaskId,
  },
  responses: {
    [StatusCode.OK]: {
      description: "Task update",
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
    },
    [StatusCode.NOT_FOUND]: {
      description: "Task not found",
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

taskRoutes.use('/:id', authenticate)
taskRoutes.use('/:id/:taskId', authenticate)

taskRoutes
  .openapi(getTasksRoute, taskListHandler as any)
  .openapi(insertTaskRoute, createTaskHandler as any)
  .openapi(updateTaskRoute, updateTaskHandler as any)
  .openapi(deleteTaskRoute, deleteTaskHandler as any)

export default taskRoutes;
