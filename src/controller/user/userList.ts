import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AppBindings } from "bindings";
import { Context } from "hono";
import { selectUserSchema, userTable } from "db/user";
import { basicAuth } from "hono/basic-auth";

export class UserList extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Fetch all Users",
    request: {},
    responses: {
      "200": {
        description: "Returns a list of all Users",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({ selectUserSchema }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context<AppBindings>) {
    basicAuth({
      username: c.env.USERNAME,
      password: c.env.PASSWORD,
    });
    try {
      const res = await c.get("db").select().from(userTable);
      return { res: res };
    } catch (error) {
      console.log("Error:", error);
      return c.json(
        {
          success: false,
          error: String(error),
        },
        500,
      );
    }
  }
}
