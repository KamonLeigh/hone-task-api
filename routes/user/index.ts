import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertUsersSchema } from "@db/schema";
import { signUp, signIn, me, logout, refreshTokenHandler } from "./handler";
import authenticate from "../../middleware/auth";
const userRoutes = new Hono();

userRoutes
  .post("/signup", zValidator("json", insertUsersSchema), signUp)
  .post("/signin", zValidator("json", insertUsersSchema), signIn)
  .get("/me", authenticate, me)
  .post("/logout", authenticate, logout)
  .post("/refreshToken", authenticate, refreshTokenHandler);

export default userRoutes;
