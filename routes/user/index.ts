import {OpenAPIHono, createRoute, z} from '@hono/zod-openapi'
import { insertUsersSchema } from "@db/schema";
import { StatusCode, type AppEnv } from "@util";
import { signUp, signIn, me, logout, refreshTokenHandler } from "./handler";
import authenticate from "../../middleware/auth";
const userRoutes = new OpenAPIHono<AppEnv>();

export const createUserRoute = createRoute({
  method: "post",
  path: "/signup",
  tags: ["User"],
  request: {
    body: {
      content: {"application/json": { schema: insertUsersSchema}}
    }
  },
  responses: {
    [StatusCode.OK]: {
      description: "User created",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              id: z.string(),
              token: z.string()
            }),
            message: z.string(),
            status: z.number()
          })
        }
      }
    }
  }
})

const authenticateUserRoute = createRoute({
  method: "post",
  path: "/signin",
  tags: ["User"],
  request: {
    body: {
      content: { "application/json": { schema: insertUsersSchema}}
    }
  },
  responses: {
    [StatusCode.OK]: {
      description: "User authenticated",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              token: z.string()
            }),
            message: z.string(),
            status: z.number()
          })
        }
      }
    }
  }
})

const getUserRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  responses: {
    [StatusCode.OK]: {
      description: "Get user",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              user: z.object({
                id: z.string(),
                name: z.string()
              }),
              message: z.string(),
              status: z.string()
            })
          })
        }
      }
    },
    [StatusCode.UNAUTHORIZED]: {
      description: "User not authorised",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            status: z.string()
          })
        }
      }
    }
  }
})

const deauthenticateUserRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: "Logout user",
      content: {

      }
    }
  }
})

const refreshTokenUserRoutes = createRoute({
  method: "post",
  path: "/refreshToken",
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  responses: {
    [StatusCode.OK]: {
      description: "Refresh token",
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              token: z.string()
            }),
            message: z.string(),
            status: z.string()
          })
        }
      }
    },
    [StatusCode.INTERNAL_SERVER_ERROR]: {
      description: "Refresh token",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            status: z.string()
          })
        }
      }
    }
  }
})

userRoutes.use('/me', authenticate)
userRoutes.use('/logout', authenticate)
userRoutes.use('/refreshToken', authenticate)

userRoutes
  .openapi(createUserRoute, signUp as any)
  .openapi(authenticateUserRoute, signIn as any)
  .openapi(getUserRoute, me as any)
  .openapi(deauthenticateUserRoute, logout as any)
  .openapi(refreshTokenUserRoutes, refreshTokenHandler as any)

export default userRoutes;
