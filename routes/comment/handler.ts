import { eq, and } from "drizzle-orm";
import { db } from "@db/db";
import { selectCommentsSchema, comments } from "@db/schema";
import type { CreateCommentBody } from "@db/schema";
import type { Context } from "hono";

interface CustomContext extends Context {
  get(key: "user"): { id: string };
  req: Context["req"] & {
    valid<T = CreateCommentBody>(target: "json"): T;
  };
}

export interface CommentResponse {
  id: string;
  message?: string;
}

export async function createCommentHandler(c: CustomContext) {
  const { taskId } = c.req.param();
  const { id: authorId } = c.get("user");
  const { comment } = c.req.valid("json");

  const result = await db
    .insert(comments)
    .values({ comment, authorId, taskId })
    .returning({ id: comments.slug });

  const res: CommentResponse = {
    id: result[0].id,
  };

  return c.json(res, 201);
}
