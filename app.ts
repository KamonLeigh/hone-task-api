import { Hono } from "hono";
import type { Context } from "hono";
import config from "./config";
import { onError, onNotFound } from "@util";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import userRoutes from "@routes/user";
import projectRoutes from "@routes/project";
import taskRoutes from "@routes/task";
import commentRoutes from "@routes/comment";

const app = new Hono();
app.use(logger());
app.use("*", cors());
app.get("/", (c) => {
  return c.text(`Hello Hono  ${Bun.env.NODE_ENV}`);
});

if (config.isDevelopment) {
  console.log("running in development");
}
app.route("/user", userRoutes);
app.route("/project", projectRoutes);
app.route("/task", taskRoutes);
app.route("/comment", commentRoutes);
app.get("/ui", swaggerUI({ url: "/doc" }));
app.notFound(onNotFound);

app.onError(onError);

export default app;
