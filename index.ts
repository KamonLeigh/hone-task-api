import app from "./app";
import config from "./config";
const fetch = app.fetch;
Bun.serve({
  port: config.PORT,
  fetch,
});
console.log(`Server running on ${config.PORT}`);
