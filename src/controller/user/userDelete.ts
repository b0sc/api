import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { AppBindings } from "bindings";
import { Context } from "hono";
import { selectUserSchema, userTable } from "db/user";
import { basicAuth } from "hono/basic-auth";
import { user } from "db/schema";
import { eq } from "drizzle-orm";

export class UserDelete extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Delete a User",
    request: {
      params: z.object({
        userSlug: z.number({ description: "User slug" }),
      }),
    },
    responses: {
      "200": {
        description: "Returns if the user was deleted successfully",
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
    basicAuth({
      username: c.env.USERNAME,
      password: c.env.PASSWORD,
    });
    try {
      console.log("test1");
      const data = await this.getValidatedData<typeof this.schema>();
      console.log("test3");
      const userSlug = data.params.userSlug;
      console.log(userSlug);
      const userRes = await c.get("db").query.user.findFirst({
        where: (u, { eq }) => eq(u.id, userSlug),
      });
      if (!userRes) {
        throw new Error("User Doesn't exist");
      }
      if (userRes.role != "audience") {
        throw new Error("you can only delete audience");
      }
      const res = await c
        .get("db")
        .delete(userTable)
        .where(eq(user.id, userSlug));
      if (!res.success) {
        throw new Error("Could not delete from db");
      }
      return { user: userRes };
    } catch (error) {
      console.log("Error: ", error);
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
