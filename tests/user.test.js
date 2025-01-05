import { db } from "@db/db";
import app from "@app";
import { expect, test, describe } from "bun:test";
import { verifyJWTfn } from "@auth";
import { createTestRequest, generateTokenUser } from "./util-test";

describe("Create user", () => {
  const userData = {
    name: "ryan",
    password: "password1234",
  };

  test("Should find user", async () => {
    const user = await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.name, "leigh");
      },
    });
    expect(user.name).toBe("leigh");
  });

  test("Should create user", async () => {
    const req = createTestRequest("/user/signup", {
      method: "POST",
      body: userData,
    });

    const res = await app.fetch(req);
    await res.json();

    expect(res.status).toBe(201);

    const user = await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.name, "ryan");
      },
    });

    expect(user.name).toBe("ryan");
  });

  test("Should login new user", async () => {
    const token = await generateTokenUser(userData);

    const userPayload = verifyJWTfn(token.token);

    expect(userPayload.name).toBe("ryan");
  });
});

describe("test profile of user", async () => {
  const userData = {
    name: "leigh",
    password: "password1234",
  };

  const tokenPayload = await generateTokenUser(userData);

  test("Should not get profile of user w/o valididation", async () => {
    const req = createTestRequest("/user/me", {
      method: "GET",
    });

    const res = await app.fetch(req);
    await res.json();

    expect(res.status).toBe(401);
  });

  test("Should get profile of user", async () => {
    const headers = {
      Authorization: `Bearer ${tokenPayload.token}`,
    };
    const req = createTestRequest("/user/me", {
      method: "GET",
      headers,
    });

    const res = await app.fetch(req);
    const data = await res.json();

    expect(data.user.name).toBe(userData.name);
    expect(res.status).toBe(200);
  });
});
