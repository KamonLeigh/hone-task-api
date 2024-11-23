import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertUsersSchema } from "@db/schema";
import { signUp, signIn, me, logout, refreshTokenHandler } from "./handler";
import authenticate from "../../middleware/auth";
const userRoutes = new Hono();

userRoutes
  .post(
    "/signup",
    zValidator("json", insertUsersSchema),
    signUp as unknown as any,
  )
  .post(
    "/signin",
    zValidator("json", insertUsersSchema),
    signIn as unknown as any,
  )
  .get("/me", authenticate, me)
  .post("/logout", authenticate, logout)
  .post("/refreshToken", authenticate, refreshTokenHandler);

export default userRoutes;
