import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "@hono/zod-openapi";
import autheticate from "../../middleware/auth";
import { insertProjectsSchema } from "@db/schema";
import {
  createProjectHandler,
  projectHandeler,
  projectListHandler,
  updateProjectHandeler,
} from "./handler";

import type { NewProjectResponse } from "./handler";

const projectRoutes = new Hono();

const paramsId = z.object({
  id: z.string(),
});

projectRoutes
  .post(
    "/",
    autheticate,
    zValidator("json", insertProjectsSchema),
    createProjectHandler as unknown as any,
  )
  .get("/:id", autheticate, zValidator("query", paramsId), projectHandeler)
  .get("/", autheticate, projectListHandler)
  .put(
    "/:id",
    autheticate,
    zValidator("json", insertProjectsSchema),
    updateProjectHandeler as unknown as any,
  );
export default projectRoutes;
