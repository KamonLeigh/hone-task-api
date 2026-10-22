import { OpenAPIHono, z, createRoute} from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import authenticate from "@middleware/auth";
import { insertCommentsSchema, selectCommentsSchema } from "@db/schema";
import { StatusCode, type AppEnv } from "@util";
import {
  createCommentHandler,
  getCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "./handler";
import { paramsId } from "@routes/project";

const commentRoutes = new OpenAPIHono<AppEnv>();

const taskParamId = z.object({
  taskId: z.string(),
});

const commentParamId = z.object({
  id: z.string(),
});

export const createCommentRoutes = createRoute({
  method: "post",
  path: "/:taskId",
  tags: ["Comment"],
  security: [{ bearerAuth: [] }],
  request: {
    params: taskParamId,
    body: {
      content: {
        "application/json": {
          schema: insertCommentsSchema
        }
      }
    }
  },
  responses: {
    [StatusCode.CREATED]: {
      description: "Creat comment",
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

export const getCommentsRoute = createRoute({
  method: "get",
  path: "/:taskId",
  tags: ["Comment"],
  security: [{ bearerAuth: [] }],
  request: { params: taskParamId },
  responses: {
    [StatusCode.OK]: {
      description: "Comments for task",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(selectCommentsSchema),
            message: z.string(),
            status: z.number()
          })
        }
      }
    }
  }

})

export const updateCommentRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags:['Comment'],
  security: [{ bearerAuth: [] }],
  request: {
    params: paramsId,
    body: {
      content: {
        "application/json": {
          schema: insertCommentsSchema
        }
      }
    }
  },
  responses: {
    [StatusCode.OK]: {
      description: "Update commnet",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              name: z.string()
            }),
            message: z.string(),
            status: z.number()
          })
        }
      }
    },
    [StatusCode.NOT_FOUND]: {
      description: "Comment not found",
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


export const deleteCommentRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags:['Comment'],
  security: [{ bearerAuth: [] }],
  responses: {
    [StatusCode.OK]: {
      description: "Commnet deleted",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              id: z.number()
            }),
            message: z.string(),
            status: z.number()
          })
        }
      }
    },
    [StatusCode.NOT_FOUND]: {
      description: "Comment not found",
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

commentRoutes.use('/:id', authenticate)
commentRoutes.use('/:taskId', authenticate)

commentRoutes
  .openapi(createCommentRoutes, createCommentHandler as any)
  .openapi(getCommentsRoute, getCommentHandler as any)
  .openapi(updateCommentRoute, updateCommentHandler as any)
  .openapi(deleteCommentRoute, deleteCommentHandler as any)


export default commentRoutes;
