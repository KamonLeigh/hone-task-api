import { db } from "@db/db";
import { users, selectUsersSchema } from "@db/schema";
import { generateHash, StatusCode, CustomError, successResponse,errorResponse } from "@util";
import { generateToken, revokeToken } from "@auth";
import type { Context } from "hono";



import type { User } from "@db/schema";

export type Token = Pick<User, "id" | "name">;

interface CustomContext extends Context {
  get(key: "user"): { id: string };
  req: Context["req"] & {
    valid<T>(target: "json"): { name: string; password: string };
  };
}

export async function signUp(c: CustomContext) {
  const { name, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, name);
    },
  });

  if (user) {
    return errorResponse(c, {
      message: "name is already taken",
      status: StatusCode.CONFLICT
    })
  }

  const { salt, hash } = await generateHash(password);

  const [newUser] = await db.insert(users).values({ name, salt, hash }).returning({
    id: users.id,
    name: users.name
  });

  const token = generateToken({ id: newUser.id, name: newUser.name })

  return successResponse(c, {
    data: {
      user: newUser,
      token
    },
    message: "User created",
    status: StatusCode.CREATED
  })
}

export async function signIn(c: CustomContext) {
  const { name, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, name);
    },
  });

  if (!user) {
    const error = new CustomError("wrong credentials provided", StatusCode.UNAUTHORIZED);
    throw error;
  }

  const { hash } = await generateHash(password, user.salt);

  if (hash !== user.hash) {
    const error = new CustomError("wrong credentials provided", StatusCode.UNAUTHORIZED);
    throw error;
  }

  const data: Token = {
    id: user.id,
    name: user.name,
  };

  const token = generateToken(data);

  return successResponse(c, {
    data: {
      token
    },
    message: "User logged in",
    status: StatusCode.OK
  })
}

export async function me(c: Context) {
  const userData = c.get("user");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, userData.id);
    },
  });

  if (!user) {
    return errorResponse(c, {
      message: "User not found",
      status: StatusCode.UNAUTHORIZED
    })
  }

  const userResponse = selectUsersSchema.parse(userData);
  return successResponse(c, {
    data: {
      user: userResponse
    },
    message: "User",
    status: StatusCode.OK
  })
}

export function logout(c: Context) {
  const authHeader = c.req.header("Authorization") as string;
  const token = authHeader.split(" ")[1];

  revokeToken(token);
  c.status(StatusCode.NO_CONTENT)
  return c.body(null);
}

export function refreshTokenHandler(c: Context) {
  const user = c.get("user");

  const token = generateToken(user);
  return successResponse(c, {
    data: {
      token
    },
    message: "Refreshed User",
    status: StatusCode.OK
  })
}
