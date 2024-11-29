import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AppBindings } from "bindings";
import { initalizeDB } from "./db/db";
import { admin, home } from "./routes/routes";
import { fromHono } from "chanfana";
import {
  UserCreate,
  UserDelete,
  UserList,
  UserRead,
} from "controller/user/user";

const app = new Hono<AppBindings>();
app
  .use(logger())
  .use((c, next) => {
    const handler = cors({
      origin: c.env.WEB_DOMAIN,
      credentials: true,
    });
    return handler(c, next);
  })
  .use((c, next) => {
    initalizeDB(c);
    return next();
  });

app.route("/", home);
app.route("/admin", admin);

const openapi = fromHono(app, {
  docs_url: "/api",
});

openapi.get("/user", UserList);
openapi.post("/user", UserCreate);
openapi.get("/user/:taskSlug", UserRead);
openapi.delete("/user/:taskSlug", UserDelete);

export default app;
