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
});
