import { verifyJWTfn, isTokenRevoked } from "@auth";
import { StatusCode, errorResponse } from "@util";
import type { Context } from "hono";

export default async function (c: Context, next: any) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(c, {
      message: "No token provided",
      status: StatusCode.UNAUTHORIZED
    })
  }

  try {
    const token = authHeader.split(" ")[1];

    const isRevoked = isTokenRevoked(token);

    if (isRevoked) {
      return errorResponse(c, {
        message: "Invalid token",
        status: StatusCode.UNAUTHORIZED
      })
    }

    const user = verifyJWTfn(token);

    c.set("user", user);
    await next();
  } catch {
    return errorResponse(c, {
      message: "Invalid token",
      status: StatusCode.UNAUTHORIZED
    })

  }
}
