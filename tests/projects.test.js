import { db } from "@db/db";
import app from "@app";
import { createTestRequest, generateTokenUser } from "./util-test";
import { PASSWORD, projectsList } from "./data";
import { expect, test, describe } from "bun:test";

describe("retrive data from users projects", async () => {
  const userOne = {
    name: "leigh",
    password: PASSWORD,
  };

  const userTwo = {
    name: "peter",
    password: PASSWORD,
  };
  let projects;
  const userOneTokenPayload = await generateTokenUser(userOne);
  const userTwoTokenPayload = await generateTokenUser(userTwo);

  const userOneHeaders = {
    Authorization: `Bearer ${userOneTokenPayload.token}`,
  };

  const userTwoHeaders = {
    Authorization: `Bearer ${userTwoTokenPayload.token}`,
  };

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

  test("Should get project with :id", async () => {
    const req = createTestRequest(`/project/${projects.data[0].slug}`, {
      method: "GET",
    });
    const res = await app.fetch(req);
    await res.json();
    expect(res.status).toBe(401);

    const reqTwo = createTestRequest(`/project/${projects.data[0].slug}`, {
      method: "GET",
      headers: userOneHeaders,
    });

    const resTwo = await app.fetch(reqTwo);
    const result = await resTwo.json();

    expect(resTwo.status).toBe(200);
    expect(result.data.name).toEqual(projectsList.one[0]);

    const reqThree = createTestRequest(`/project/${projects.data[0].slug}`, {
      method: "GET",
      headers: userTwoHeaders,
    });

    const resThree = await app.fetch(reqThree);
    await resThree.json();
    expect(resThree.status).toBe(200);
  });
});
