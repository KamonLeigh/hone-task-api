import { eq, and } from "drizzle-orm";
import { db } from "@db/db";
import { selectCommentsSchema, comments, tasks } from "@db/schema";
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

export async function getCommentHandler(c: Context) {
  const { taskId } = c.req.param();
  const commentList = await db
    .select()
    .from(comments)
    .where(eq(comments.taskId, taskId));

  if (!commentList) {
    return c.json(
      {
        error: "Comment(s) not found",
      },
      404,
    );
  }

  return c.json(
    {
      data: commentList.map((comment) => selectCommentsSchema.parse(comment)),
    },
    200,
  );
}

export async function updateCommentHandler(c: CustomContext) {
  const { id: slug } = c.req.param();
  const { id: authorId } = c.get("user");
  const { comment } = c.req.valid("json");

  const result = await db
    .update(comments)
    .set({ comment })
    .where(and(eq(comments.authorId, authorId), eq(comments.slug, slug)));

  if ((result as any)?.rowCount === 0) {
    return c.json({ error: "Failed to update task" }, 404);
  }

  return c.json({ message: "Comment updated successfully" }, 200);
}

export async function deleteCommentHandler(c: Context) {
  const { id: slug } = c.req.param();
  const { id: authorId } = c.get("user");

  const comment = await db
    .delete(tasks)
    .where(and(eq(comments.slug, slug), eq(comments.authorId, authorId)))
    .returning({
      id: tasks.slug,
    });

  const res: CommentResponse = {
    id: comment[0].id,
    message: "Comment removed",
  };

  return c.json(res, 200);
}
