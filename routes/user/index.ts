import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertUsersSchema } from "@db/schema";
import { signUp, signIn, me, logout } from "./handler";
import authenticate from "../../middleware/auth";
const userRoutes = new Hono();

userRoutes.get("/", (c) => {
  return c.text("This is the user route");
});

userRoutes
  .post("/signup", zValidator("json", insertUsersSchema), signUp)
  .post("/signin", zValidator("json", insertUsersSchema), signIn)
  .get("/me", authenticate, me)
  .post("/logout", authenticate, logout);

export default userRoutes;
