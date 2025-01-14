import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "@hono/zod-openapi";
import authenticate from "@middleware/auth";
import { insertProjectsSchema } from "@db/schema";
import {
  createProjectHandler,
  deleteProjectHandeler,
  projectHandeler,
  projectListHandler,
  updateProjectHandeler,
} from "./handler";

import type { NewProjectResponse } from "./handler";

const projectRoutes = new Hono();

export const paramsId = z.object({
  id: z.string(),
});

projectRoutes
  .post(
    "/",
    authenticate,
    zValidator("json", insertProjectsSchema),
    createProjectHandler as unknown as any,
  )
  .get("/:id", authenticate, zValidator("param", paramsId), projectHandeler)
  .get("/", authenticate, projectListHandler)
  .put(
    "/:id",
    authenticate,
    zValidator("json", insertProjectsSchema),
    updateProjectHandeler as unknown as any,
  )
  .delete(
    "/:id",
    authenticate,
    zValidator("param", paramsId),
    deleteProjectHandeler,
  );
export default projectRoutes;
