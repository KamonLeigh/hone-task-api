import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import autheticate from "@middleware/auth";
import { insertCommentsSchema } from "@db/schema";
import { z } from "@hono/zod-openapi";
import { createCommentHandler } from "./handler";

const commentRoutes = new Hono();

const taskParamId = z.object({
  taskId: z.string(),
});

commentRoutes.post(
  "/:taskId",
  autheticate,
  zValidator("param", taskParamId),
  zValidator("json", insertCommentsSchema),
  createCommentHandler,
);

export default commentRoutes;
