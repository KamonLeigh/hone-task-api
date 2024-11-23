import { verifyJWTfn, isTokenRevoked } from "@auth";
import type { Context } from "hono";

export default async function (c: Context, next: any) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        message: "No token provided",
      },
      401,
    );
  }

  try {
    const token = authHeader.split(" ")[1];

    const isRevoked = isTokenRevoked(token);

    if (isRevoked) {
      return c.json({ message: "Invalid token" });
    }

    const user = verifyJWTfn(token);

    if (typeof user === "boolean" && user) {
      return c.json({ message: "Invalid token" }, 401);
    }

    c.set("user", user);
    await next();
  } catch {
    return c.json({ message: "Invalid token" }, 401);
  }
}
