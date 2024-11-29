import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { basicAuth } from "hono/basic-auth";
import { env } from "hono/adapter";

type Bindings = {
  USERNAME: string;
  PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/admin/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  });
  return auth(c, next);
});

app.get("/admin", (c) => {
  return c.text("You are authorized!");
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/api",
});

// Register OpenAPI endpoints
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);

app.get("/", (c) => {
  // const val = c.get("result"); // val is a string
  // const username = c.env.USERNAME;
  const username = env(c).USERNAME;
  console.log(username);
  return c.html(`
    <!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="club, opensource" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.png" />
    <title>BOSC-API</title>
    <meta
      name="description"
      content="BOSC is a club for opensource enthusiasts from Birendra Multiple Campus. This is the BOSC's official website's API."
    />

  </head>
  <body>
  <h1>Welcome to BOSC API</h1>
  <p>
  This is the API for the BOSC website. You can use this API to interact
  with the BOSC website.
  </p>
  <a href="/api">API</a>
    <h1> Login as a Club Executive</h1>
    <form action="/admin" method="get">
      <button type="submit">Login</button>
    </form>
  </body>
</html>
    `);
});

// Export the Hono app
export default app;
