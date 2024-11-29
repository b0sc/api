import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Task, User } from "../../types";
import { AppBindings } from "bindings";
import { Context } from "hono";
import { userTable } from "db/user";
import { log } from "console";

export class UserCreate extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Create a new User",
    request: {
      body: {
        content: {
          "application/json": {
            schema: User,
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
              series: z.object({
                success: Bool(),
                result: z.object({
                  user: User,
                }),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context<AppBindings>) {
    // Get validated data
    // console.log("Validating data", c);

    const data = await this.getValidatedData<typeof this.schema>();

    // Retrieve the validated request body
    const user = data.body;
    console.log("User", user);

    // Implement your own object insertion here
    const db = c.get("db");
    const res = await db.insert(userTable).values({
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      refreshToken: user.refreshToken,
    });

    // return the new task
    return {
      success: true,
      result: res,
    };
  }
}
