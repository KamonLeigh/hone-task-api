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

  const userOneTokenPayload = await generateTokenUser(userOne);

  const userOneHeaders = {
    Authorization: `Bearer ${userOneTokenPayload.token}`,
  };

  test("Should list all the projects", async () => {
    const req = createTestRequest("/project", {
      method: "GET",
      headers: userOneHeaders,
    });

    const res = await app.fetch(req);
    const projects = await res.json();

    const result = projects.data.map((project) => {
      return project.name;
    });

    expect(result).toEqual(projectsList.one);
  });
});
