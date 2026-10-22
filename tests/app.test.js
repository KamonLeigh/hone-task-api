import app from "@app";
import { expect, test, describe } from "bun:test";
import { createTestRequest } from "./util-test";


describe("Test headers for app", () => {
  test("Should drop CORS headers completely and enforce tight polices", async () => {
    const req = createTestRequest("/", {
      method: "GET"
    })
    const res = await app.fetch(req)
    const result = await res.text()
    expect(res.status).toBe(200)
    expect(result).toBe("Hello Hono test")

    // CORS should not exist on this machine to machine route
    expect(res.headers.get("Allow-Control-Allow-Origin")).toBeNull()

    // System Isolation Protection headers
    expect(res.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin")
    expect(res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin")
  })
})
