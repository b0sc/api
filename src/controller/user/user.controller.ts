import { Context, Hono } from "hono";

import type { AppBindings } from "bindings";

const UserController = new Hono<AppBindings>()
  .get("/profile", (c) => {
    const user = c.get("user");
    return c.json(user);
  })
  .get("/oauth-accounts", async (c) => {
    const oauthAccounts = await c.get("db").query.oauthAccount.findMany({
      where: (u, { eq }) => eq(u.userId, c.get("user")?.id ?? ""),
    });
    return c.json({
      accounts: oauthAccounts.map((oa) => ({
        provider: oa.provider,
      })),
    });
  });

const fetchRefreshToken = async (c: Context<AppBindings>, id: string) => {
  return c
    .get("db")
    .query.user.findFirst({
      where: (u, { eq }) => eq(u.id, Number(id)),
    })
    .then((user) => user?.refreshToken);
};

export { UserController, fetchRefreshToken };
