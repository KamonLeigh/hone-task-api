import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import type { Context } from "hono";
import config from "./config";
import { onError, onNotFound } from "@util";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import userRoutes from "@routes/user";
import projectRoutes from "@routes/project";
import taskRoutes from "@routes/task";
import commentRoutes from "@routes/comment";

const app = new OpenAPIHono();
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
app.notFound(onNotFound);

app.onError(onError);
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Hono Task API',
    version: '1.0.0'
  }
})

app.get('/ui', swaggerUI({ url: '/doc'}))

export default app;
