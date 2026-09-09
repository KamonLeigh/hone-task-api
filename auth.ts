import config from "./config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { z } from "@hono/zod-openapi";

const dataSchema = z.object({
  id: z.string().min(10, { message: "Must be 10 chatractors" }),
  name: z.string().min(2, { message: "Must be 2 or more characters long" }),
});

export type Data = z.infer<typeof dataSchema>;

const revokedToken = new Map<string, number>();

export function generateToken(data: Data): string {
  return jwt.sign(data, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE_IN as string,
  } as jwt.SignOptions);
}

export function verifyJWTfn(token: string): string | boolean | JwtPayload {
  const isRevoked = isTokenRevoked(token);
  if (isRevoked) return true;
  return jwt.verify(token, config.JWT_SECRET);
}

export function isTokenRevoked(token: string): boolean {
  if (!revokedToken.has(token)) return false

  const expiredAt = revokedToken.get(token)!

  if (Date.now() > expiredAt) {
    revokedToken.delete(token)
    return false
  }
  return true
}
export function revokeToken(token: string): void {
  const decode = jwt.decode(token) as JwtPayload | null
  if (decode?.exp) {
    revokedToken.set(token, decode.exp * 1000)
  }
}
