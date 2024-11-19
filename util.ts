import { v4 } from "uuid";
import type { ErrorHandler, NotFoundHandler } from "hono";
import crypto from "node:crypto";
import util from "node:util";
import config from "@config";

export function generateKey(): string {
  return v4();
}

const OK = 200;
const INTERNAL_SERVER_ERROR = 500;
type StatusCode = 400 | 401 | 403 | 404 | 500;
const NOT_FOUND = 404;

export const onError: ErrorHandler = (err, c) => {
  const currentStatus =
    "status" in err ? err.status : c.newResponse(null).status;

  const statusCode =
    currentStatus !== OK
      ? (currentStatus as StatusCode)
      : INTERNAL_SERVER_ERROR;

  return c.json(
    {
      message: err.message,
      stack: config.isDevelopment ? err.stack : undefined,
    },
    statusCode,
  );
};

export class CustomError extends Error {
  status: StatusCode;
  constructor(message: string, status: StatusCode) {
    super(message);
    this.status = status;
  }
}

export const onNotFound: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `route not found: ${c.req.path}`,
    },
    NOT_FOUND,
  );
};
const pbkdf = util.promisify(crypto.pbkdf2);
export async function generateHash(password: string, salt?: string) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex");
  }

  const newSalt = salt + config.PASSWORD_SALT;
  const hash = (await pbkdf(password, newSalt, 1000, 64, "sha256")).toString(
    "hex",
  );

  return { hash, salt };
}
