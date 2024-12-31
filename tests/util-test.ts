import config from "@config";
import app from "@app";

export const createTestRequest = (
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {},
) => {
  const { method = "GET", headers = {}, body } = options;

  return new Request(`http://localhost:${config.PORT}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
};

export const generateTokenUser = async (body: {
  name: string;
  password: string;
}) => {
  const req = createTestRequest("/user/signin", {
    method: "POST",
    body,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  return data;
};
