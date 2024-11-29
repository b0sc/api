import { AppBindings } from "bindings";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";

// admin route
const admin = new Hono<AppBindings>();
admin.use("/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  });
  return auth(c, next);
});
admin.get("/", (c) => {
  return c.text("You are authorized!");
});

const home = new Hono<AppBindings>();
home.get("/", (c) => {
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

export { admin, home };
