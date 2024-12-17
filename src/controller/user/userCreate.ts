import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppBindings } from "bindings";
import { Context } from "hono";
import { insertUserSchema, selectUserSchema, userTable } from "db/user";
import type { InsertUser } from "db/user";

export class UserCreate extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Create a new User",
    request: {
      body: {
        content: {
          "application/json": {
            schema: insertUserSchema,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the created User",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                user: selectUserSchema,
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context<AppBindings>) {
    try {
      const data = await this.getValidatedData<typeof this.schema>();

      const user = data.body;
      user.role = "audience";
      user.emailVerified = false;
      if (user.role == "audience") {
        user.password = "";
      }
      console.log("User", user);

      // todo: error with insertuser available fields, file:types.ts, user/userCreate.ts, auth/google.ts, db/user.ts
      await c.get("db").insert(userTable).values({
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
      });
      const userRes = await c.get("db").query.user.findFirst({
        where: (u, { eq }) => eq(u.email, user.email),
      });
      console.log(userRes);

      // return the new task
      return { user: userRes };
    } catch (error) {
      console.log("Error: ", error);

      return c.json(
        {
          success: false,
          error: String(error),
        },
        500
      );
    }
  }
}
