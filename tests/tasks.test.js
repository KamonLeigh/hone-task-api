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

describe("Tests should retrive tasks from user's project create and update", async () => {
  let tasks;
  let id;
  let taskId;
  const task = "new task";
  const updatedTask = "updated task";

  test("Should list all tasks associated with a project and update a task", async () => {
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

    test("Should not list tasks without credentials", async () => {
      const req = createTestRequest(`/task/${id}`, {
        method: "GET",
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(401);
    });
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
    taskId = result.id;

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

  test("Should not update task if no credentials are provided", async () => {
    const req = createTestRequest(`/task/${id}/${taskId}`, {
      method: "PUT",
      body: {
        name: updatedTask,
      },
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(401);
    const result = await res.json();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
  });

  test("Should not update task if wrong credentials are provided", async () => {
    const req = createTestRequest(`/task/${id}/${taskId}`, {
      method: "PUT",
      body: {
        name: updatedTask,
      },
      headers: userTwoHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(404);
    const result = await res.json();
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
  });

  test("Should not update task if erroneous url is provided both params", async () => {
    const req = createTestRequest(`/task/bbbbb/aaaaaaaaa}`, {
      method: "PUT",
      body: {
        name: updatedTask,
      },
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(404);
    const result = await res.json();
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
  });

  test("Should not update task if erroneous url is provided one param: id", async () => {
    const req = createTestRequest(`/task/${id}/aaaaaaaaassss`, {
      method: "PUT",
      body: {
        name: updatedTask,
      },
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(404);
    const result = await res.json();
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
  });

  test("Should not update task if erroneous url is provided one param: id", async () => {
    const req = createTestRequest(`/task/aaaaaaaaaaaa/${taskId}`, {
      method: "PUT",
      body: {
        name: updatedTask,
      },
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(404);
    const result = await res.json();
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
  });

  test("Should not update task if wrong credentials are provided", async () => {
    const req = createTestRequest(`/task/${id}/${taskId}`, {
      method: "PUT",
      body: {
        name: updatedTask,
      },
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const result = await res.json();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
  });
});

describe("Tests handling deleting tasks", () => {
  let id;
  const task = "delete task";
  let taskId;

  test("Should not be able to delete task with no credentials", async () => {
    const reqPro = createTestRequest("/project", {
      method: "GET",
      headers: userOneHeaders,
    });

    const resPro = await app.fetch(reqPro);
    const projects = await resPro.json();
    id = projects.data[0].slug;

    const addReq = createTestRequest(`/task/${id}`, {
      method: "POST",
      body: {
        name: task,
      },
      headers: userOneHeaders,
    });

    const addRes = await app.fetch(addReq);
    const addResult = await addRes.json();
    taskId = addResult.id;

    const req = createTestRequest(`/task/${id}/${taskId}`, {
      method: "DELETE",
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(401);
    const result = await res.json();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
  });

  test("Should not be able to delete task with wrong credentials", async () => {
    const req = createTestRequest(`/task/${id}/${taskId}`, {
      method: "DELETE",
      headers: userTwoHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(404);
    const result = await res.json();
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
  });

  test("Should be able to delete task with the correct credentials", async () => {
    const req = createTestRequest(`/task/${id}/${taskId}`, {
      method: "DELETE",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    expect(res.status).toBe(200);
  });
});
