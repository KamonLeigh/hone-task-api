import app from "@app";
import { createTestRequest, generateTokenUser } from "./util-test";
import { PASSWORD, commentsListUserOne } from "./data";
import { expect, test, describe } from "bun:test";

const userOne = {
  name: "leigh",
  password: PASSWORD,
};

const userTwo = {
  name: "peter",
  password: PASSWORD,
};

const userOneTokenPayload = await generateTokenUser(userOne);
const userTwoTokenPayload = await generateTokenUser(userTwo);

const userOneHeaders = {
  Authorization: `Bearer ${userOneTokenPayload.token}`,
};

const userTwoHeaders = {
  Authorization: `Bearer ${userTwoTokenPayload.token}`,
};

describe("Tests should retrive comments from task", async () => {
  let projectId;
  let tasksIds;
  let comments;
  let newCommentId;

  test("Should not list comments from task without credentials", async () => {
    const reqPro = createTestRequest("/project", {
      method: "GET",
      headers: userOneHeaders,
    });

    const resPro = await app.fetch(reqPro);
    const projects = await resPro.json();
    projectId = projects.data[0].slug;

    const reqTask = createTestRequest(`/task/${projectId}`, {
      method: "GET",
      headers: userOneHeaders,
    });

    const resTask = await app.fetch(reqTask);
    const resultTask = await resTask.json();
    tasksIds = resultTask.data.map((task) => task.slug);

    const req = createTestRequest(`/comment/${tasksIds[0]}`, {
      method: "GET",
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  test("Should list comments for task with credentials", async () => {
    const req = createTestRequest(`/comment/${tasksIds[0]}`, {
      method: "GET",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    comments = await res.json();
    const result = comments.data.map((comment) => comment.comment);
    expect(res.status).toBe(200);
    expect(result).toEqual(commentsListUserOne[1]);
  });

  test("Should not list comments for user one", async () => {
    const req = createTestRequest(`/comment/${tasksIds[0]}`, {
      method: "GET",
      headers: userTwoHeaders,
    });

    const res = await app.fetch(req);
    comments = await res.json();

    let result = [];

    if (comments.length > 0) {
      result = comments.data.map((comment) => comment.comment);
    }

    expect(res.status).toBe(200);
    expect(result).not.toEqual(commentsListUserOne[1]);
  });

  test("Should not allow user to create comment without credentials", async () => {
    const req = createTestRequest(`/comment/${tasksIds[0]}`, {
      method: "POST",
      body: {
        comment: "This is a new comment",
      },
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  test("Should allow user to create comment without credentials", async () => {
    const req = createTestRequest(`/comment/${tasksIds[0]}`, {
      method: "POST",
      headers: userOneHeaders,
      body: {
        comment: "This is a new comment",
      },
    });

    const res = await app.fetch(req);
    const result = await res.json();

    newCommentId = result.id;
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(res.status).toBe(201);
  });

  test("Should not be able to update with invalid id", async () => {
    const req = createTestRequest(`/comment/aaaaaaaaaaaa`, {
      method: "PUT",
      headers: userOneHeaders,
      body: {
        comment: "Update new comment",
      },
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(404);
  });

  test("Should be able to update comment", async () => {
    const req = createTestRequest(`/comment/${newCommentId}`, {
      method: "PUT",
      headers: userOneHeaders,
      body: {
        comment: "Update new comment",
      },
    });

    const res = await app.fetch(req);
    const result = await res.json();
    expect(result.message).toBe("Comment updated successfully");
    expect(res.status).toBe(200);
  });

  test("Should not be able to delete without credentials", async () => {
    const req = createTestRequest(`/comment/aaaaaaaaaaaa`, {
      method: "DELETE",
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  test("Should not be able to delete with invalid id", async () => {
    const req = createTestRequest(`/comment/aaaaaaaaaaaa`, {
      method: "DELETE",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(404);
  });

  test("Should be able to delete comment", async () => {
    const req = createTestRequest(`/comment/${newCommentId}`, {
      method: "DELETE",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(200);
  });
});
