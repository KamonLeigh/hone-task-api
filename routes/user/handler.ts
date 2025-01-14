import { db } from "@db/db";
import { users, selectUsersSchema } from "@db/schema";
import { generateHash } from "@util";
import { generateToken, revokeToken } from "@auth";
import type { Context } from "hono";
import { CustomError } from "@util";

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
    return c.json(
      {
        message: "name is already taken",
      },
      404,
    );
  }

  const { salt, hash } = await generateHash(password);

  const newUser = await db.insert(users).values({ name, salt, hash });

  return c.json(
    {
      user: newUser,
    },
    201,
  );
}

export async function signIn(c: CustomContext) {
  const { name, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.name, name);
    },
  });

  if (!user) {
    const error = new CustomError("wrong credentials provided", 401);
    throw error;
  }

  const { hash } = await generateHash(password, user.salt);

  if (hash !== user.hash) {
    const error = new CustomError("wrong credentials provided", 401);
    throw error;
  }

  const data: Token = {
    id: user.id,
    name: user.name,
  };

  const token = generateToken(data);

  return c.json({
    token,
  });
}

export async function me(c: Context) {
  const userData = c.get("user");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, userData.id);
    },
  });

  if (!user) {
    return c.json(
      {
        message: "User not found",
      },
      401,
    );
  }

  const userResponse = selectUsersSchema.parse(userData);

  return c.json(
    {
      user: userResponse,
    },
    200,
  );
}

export function logout(c: Context) {
  const authHeader = c.req.header("Authorization") as string;
  const token = authHeader.split(" ")[1];

  revokeToken(token);
  return c.json({}, 204);
}

export function refreshTokenHandler(c: Context) {
  const user = c.get("user");

  const token = generateToken(user);

  return c.json({
    token,
  });
}
