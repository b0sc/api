import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AppBindings } from "bindings";
import { initalizeDB } from "./db/db";
import { admin, home } from "./routes/routes";
import { fromHono } from "chanfana";
import { UserCreate } from "controller/user/userCreate";
import { UserList } from "controller/user/userList";
import { AuthController } from "controller/auth/auth.controller";
import { MailPost } from "controller/mail/mail";

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
  .use(async (c, next) => {
    initalizeDB(c);
    const limit = c.req.url;
    const { success } = await c.env.MY_RATE_LIMITER.limit({ key: limit });
    if (!success) {
      return new Response(`429 Failure – rate limit exceeded for ${limit}`, {
        status: 429,
      });
    }
    return next();
  });

app.route("/", home);
app.route("/admin", admin);
app.route("/auth", AuthController);

const openapi = fromHono(app, {
  docs_url: "/api",
});

openapi.post("/user", UserCreate);
openapi.post("/mail", MailPost);
// openapi.get("/user", UserList);
// openapi.delete("/user/:taskSlug", UserDelete);

// openapi.get("/user/:taskSlug", UserRead);

export default app;
