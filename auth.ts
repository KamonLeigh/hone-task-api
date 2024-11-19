import config from "./config";
import jwt from "jsonwebtoken";
import { z } from "@hono/zod-openapi";

const dataSchema = z.object({
  id: z.string().min(10, { message: "Must be 10 chatractors" }),
  name: z.string().min(2, { message: "Must be 2 or more characters long" }),
});

export type Data = z.infer<typeof dataSchema>;

const revokedToken = new Map<string, boolean>();

export function generateToken(data: Data): string {
  const token = jwt.sign(data, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE_IN,
  });
  return token;
}

export function verifyJWTfn(token: string) {
  const isRevoked = isTokenRevoked(token);
  console.log(isRevoked);
  if (isRevoked) return true;
  const data = jwt.verify(token, config.JWT_SECRET);

  return data;
}

export function isTokenRevoked(token: string): boolean {
  return revokedToken.has(token);
}

export function revokeToken(token: string) {
  revokedToken.set(token, true);
}
