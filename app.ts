import { Hono } from "hono";
import config from "./config";
import { onError, onNotFound } from "./util";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import userRoutes from "@routes/user";

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
app.notFound(onNotFound);

app.onError(onError);

export default app;
