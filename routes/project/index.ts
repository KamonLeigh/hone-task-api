import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "@hono/zod-openapi";
import authenticate from "@middleware/auth";
import { insertProjectsSchema } from "@db/schema";
import {
  createProjectHandler,
  deleteProjectHandler,
  projectHandler,
  projectListHandler,
  updateProjectHandler,
} from "./handler";

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
  .get("/:id", authenticate, zValidator("param", paramsId), projectHandler)
  .get("/", authenticate, projectListHandler)
  .patch(
    "/:id",
    authenticate,
    zValidator("json", insertProjectsSchema),
    updateProjectHandler as unknown as any,
  )
  .delete(
    "/:id",
    authenticate,
    zValidator("param", paramsId),
    deleteProjectHandler,
  );
export default projectRoutes;
