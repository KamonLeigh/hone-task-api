import app from "@app";
import { createTestRequest, generateTokenUser } from "./util-test";
import { PASSWORD, taskListUserOne } from "./data";
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

describe("Retrive tasks from user's project", async () => {
  let tasks;
  let id;
  const task = "new task";

  test("Should list all tasks associated with a project", async () => {
    const reqPro = createTestRequest("/project", {
      method: "GET",
      headers: userOneHeaders,
    });

    const resPro = await app.fetch(reqPro);
    const projects = await resPro.json();
    id = projects.data[0].slug;

    const req = createTestRequest(`/task/${id}`, {
      method: "GET",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    tasks = await res.json();
    expect(res.status).toBe(200);
    const result = tasks.data.map((task) => {
      return task.name;
    });

    expect(result).toEqual(taskListUserOne[1]);
  });

  test("Should not list tasks without credentials", async () => {
    const req = createTestRequest(`/task/${id}`, {
      method: "GET",
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  test("Should not be able to insert task with no user data", async () => {
    const req = createTestRequest(`/task/${id}`, {
      method: "POST",
      name: task,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  test("Should be able to insert task", async () => {
    const req = createTestRequest(`/task/${id}`, {
      method: "POST",
      body: {
        name: task,
      },
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    const result = await res.json();

    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(res.status).toBe(201);
  });

  test("Should fail if incorrect id is provide by logged in user", async () => {
    const req = createTestRequest(`/task/fhfhhfhfhfhf4`, {
      method: "POST",
      body: {
        name: task,
      },
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    const result = await res.json();
    expect(res.status).toBe(404);
    expect(result.error).toBeDefined();
  });
});
