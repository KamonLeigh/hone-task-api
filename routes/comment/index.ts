import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import authenticate from "@middleware/auth";
import { insertCommentsSchema } from "@db/schema";
import { z } from "@hono/zod-openapi";
import {
  createCommentHandler,
  getCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "./handler";

const commentRoutes = new Hono();

const taskParamId = z.object({
  taskId: z.string(),
});

const commentParamId = z.object({
  id: z.string(),
});

commentRoutes.post(
  "/:taskId",
  authenticate,
  zValidator("param", taskParamId),
  zValidator("json", insertCommentsSchema),
  createCommentHandler,
);

commentRoutes.get(
  "/:taskId",
  authenticate,
  zValidator("param", taskParamId),
  getCommentHandler,
);

commentRoutes.put(
  "/:id",
  authenticate,
  zValidator("param", commentParamId),
  zValidator("json", insertCommentsSchema),
  updateCommentHandler as unknown as any,
);

commentRoutes.delete(
  "/:id",
  authenticate,
  zValidator("param", commentParamId),
  deleteCommentHandler,
);

export default commentRoutes;
