import { db } from "@db/db";
import app from "@app";
import { createTestRequest, generateTokenUser } from "./util-test";
import { PASSWORD, projectsList } from "./data";
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

describe("retrive data from users projects", () => {
  let projects;

  test("Should list all the projects", async () => {
    const req = createTestRequest("/project", {
      method: "GET",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    projects = await res.json();

    const result = projects.data.map((project) => {
      return project.name;
    });

    expect(result).toEqual(projectsList.one);
  });

  test("Should get project with :id with correct credentials", async () => {
    const req = createTestRequest(`/project/${projects.data[0].slug}`, {
      method: "GET",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result.data.name).toEqual(projectsList.one[0]);
  });

  test("Should not get project with :id with no credentials", async () => {
    const req = createTestRequest(`/project/${projects.data[0].slug}`, {
      method: "GET",
    });
    const res = await app.fetch(req);
    await res.json();
    expect(res.status).toBe(401);
  });

  test("Should not get project with :id with wrong credentials", async () => {
    const req = createTestRequest(`/project/${projects.data[0].slug}`, {
      method: "GET",
      headers: userTwoHeaders,
    });

    const res = await app.fetch(req);
    await res.json();
    expect(res.status).toBe(200);
  });
});

describe("Create new projects", () => {
  const name = "Project 4";
  test("Should not be able to create project with no credentials", async () => {
    const req = createTestRequest("/project", {
      method: "POST",
      body: {
        name,
      },
    });

    const res = await app.fetch(req);
    await res.json();
    expect(res.status).toBe(401);
  });

  test("Should be able to create project with credentials", async () => {
    const req = createTestRequest("/project", {
      method: "POST",
      headers: userOneHeaders,
      body: {
        name,
      },
    });

    const res = await app.fetch(req);
    await res.json();
    expect(res.status).toBe(201);
  });
});

describe("Create and update project", async () => {
  const name = "Project 5";
  const newName = "Project 5 new";

  let id;

  test("Should not be able to update with no credentials", async () => {
    const req = createTestRequest("/project", {
      method: "POST",
      headers: userOneHeaders,
      body: {
        name,
      },
    });

    const res = await app.fetch(req);
    const result = await res.json();
    id = result.id;

    const reqTwo = createTestRequest(`/project/${id}`, {
      method: "PUT",
      body: {
        name: newName,
      },
    });

    const resTwo = await app.fetch(reqTwo);
    await resTwo.json();
    expect(resTwo.status).toBe(401);
  });

  test("Should be able to update project with correct credentials", async () => {
    const req = createTestRequest(`/project/${id}`, {
      method: "PUT",
      body: {
        name: newName,
      },
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    const result = await res.json();
    expect(result.message).toBe("Project updated successfully");
    expect(res.status).toBe(200);
  });

  test("Should not be able to update with incorrect credentials", async () => {
    const req = createTestRequest(`/project/${id}`, {
      method: "PUT",
      body: {
        name,
      },
      headers: userTwoHeaders,
    });

    const res = await app.fetch(req);
    const result = await res.json();
    expect(result.error).toBe("Failed to update project");
    expect(res.status).toBe(404);
  });
});

describe("Create and delete project", () => {
  const name = "Project 6";
  let id;

  test("Should not be able to delete with no credentials", async () => {
    const req = createTestRequest("/project", {
      method: "POST",
      headers: userOneHeaders,
      body: {
        name,
      },
    });

    const res = await app.fetch(req);
    const result = await res.json();
    id = result.id;

    const reqTwo = createTestRequest(`/project/${id}`, {
      method: "DELETE",
    });

    const resTwo = await app.fetch(reqTwo);
    await resTwo.json();

    expect(resTwo.status).toBe(401);
  });

  test("Should not be able to delete project with incorrect credentials", async () => {
    const req = createTestRequest(`/project/${id}`, {
      method: "DELETE",
      headers: userTwoHeaders,
    });

    const res = await app.fetch(req);
    const result = await res.json();

    expect(res.status).toBe(404);
    expect(result.message).toBe("Unable to find project");
  });

  test("Should be able to delete project with correct credentials", async () => {
    const req = createTestRequest(`/project/${id}`, {
      method: "DELETE",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result).toEqual({
      id,
      message: "project removed",
    });
  });
});
