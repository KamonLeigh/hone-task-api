import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import authenticate from "@middleware/auth";
import { paramsId } from "../project";
import { z } from "@hono/zod-openapi";
import { insertTasksSchema } from "@db/schema";
import {
  taskListHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from "./handler";

const taskRoutes = new Hono();

const paramsTaskId = paramsId.extend({
  taskId: z.string(),
});

taskRoutes
  .get("/:id", authenticate, zValidator("param", paramsId), taskListHandler)
  .post(
    "/:id",
    authenticate,
    zValidator("param", paramsId),
    zValidator("json", insertTasksSchema),
    createTaskHandler as unknown as any,
  )
  .put(
    "/:id/:taskId",
    authenticate,
    zValidator("param", paramsTaskId),
    zValidator("json", insertTasksSchema),
    updateTaskHandler as unknown as any,
  )
  .delete(
    "/:id/:taskId",
    authenticate,
    zValidator("param", paramsTaskId),
    deleteTaskHandler,
  );

export default taskRoutes;
