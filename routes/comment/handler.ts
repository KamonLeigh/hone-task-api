import { eq, and } from "drizzle-orm";
import { db } from "@db/db";
import { selectCommentsSchema, comments, tasks } from "@db/schema";
import { StatusCode, successResponse, errorResponse } from "@util";
import type { CreateCommentBody } from "@db/schema";
import type { Context } from "hono";

interface CustomContext extends Context {
  get(key: "user"): { id: string };
  req: Context["req"] & {
    valid<T = CreateCommentBody>(target: "json"): T;
  };
}

export async function createCommentHandler(c: CustomContext) {
  const { taskId } = c.req.param();
  const { id: authorId } = c.get("user");
  const { comment } = c.req.valid("json");

  const task = await db.select().from(tasks).where(eq(tasks.slug, taskId));

  if (!task.length) {
    return errorResponse(c, {
      message: "Task not found",
      status: StatusCode.NOT_FOUND
    })
  }

  const result = await db
    .insert(comments)
    .values({ comment, authorId, taskId })
    .returning({ id: comments.slug });

  return successResponse(c,
    {
      data: {
        id: result[0].id,
      },
      message: "Comment Created",
      status: StatusCode.CREATED
    })
}

export async function getCommentHandler(c: Context) {
  const { taskId } = c.req.param();
  const commentList = await db
    .select()
    .from(comments)
    .where(eq(comments.taskId, taskId));

  return successResponse(c, {
    data: commentList.map((comment) => selectCommentsSchema.parse(comment)),
    message: commentList.length ? "Comments for Task" : "No Comments found",
    status: StatusCode.OK
  })
}

export async function updateCommentHandler(c: CustomContext) {
  const { id: slug } = c.req.param();
  const { id: authorId } = c.get("user");
  const { comment } = c.req.valid("json");

  const result = await db
    .update(comments)
    .set({ comment })
    .where(and(eq(comments.authorId, authorId), eq(comments.slug, slug)));

  if ((result as any)?.changes === 0) {
    return errorResponse(c, { message: "Failed to update task", status: StatusCode.NOT_FOUND})
  }

  return successResponse(c, {
    data: {
    id: slug
    },
    message: "Comment updated successfully",
    status: StatusCode.OK
  })
}

export async function deleteCommentHandler(c: Context) {
  const { id: slug } = c.req.param();
  const { id: authorId } = c.get("user");

  const initialComment = await db
    .select({ id: comments.slug })
    .from(comments)
    .where(and(eq(comments.slug, slug), eq(comments.authorId, authorId)));

  if (!initialComment.length) {
    return errorResponse(c, { message: "Comment not found", status: StatusCode.NOT_FOUND})

  }
  const comment = await db
    .delete(comments)
    .where(and(eq(comments.slug, slug), eq(comments.authorId, authorId)))
    .returning({
      id: comments.slug,
    });

  return successResponse(c, {
    data: {
      id: comment[0].id,
    },
    message: "Comment removed",
    status: StatusCode.OK
  })
}
