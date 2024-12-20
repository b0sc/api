import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppBindings } from "bindings";
import { Context } from "hono";
import { EmailMessage } from "cloudflare:email";

const mailPostType = z.object({
  name: Str({ example: "John Doe" }),
  fromMail: Str({ example: "john.doe@gmail.com" }),
  message: Str({ required: true, example: "Hello, World!" }),
});

export class MailPost extends OpenAPIRoute {
  schema = {
    tags: ["Mail"],
    summary: "Post a new Mail",
    request: {
      body: {
        content: {
          "application/json": {
            schema: mailPostType,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the status of the mail",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context<AppBindings>) {
    try {
      const data = await this.getValidatedData<typeof this.schema>();

      const mail = data.body;
      console.log("Mail", mail);

      // const msg = createMimeMessage();
      // msg.setSender({ name: c.env.SENDER_NAME, addr: c.env.SENDER_ADDRESS });
      // msg.setRecipient(c.env.RECIPIENT_ADDRESS);
      // msg.setSubject(Body["subject"]);
      // msg.addMessage({
      //   contentType: "text/html",
      //   data: Body["body"],
      // });

      // var message = new EmailMessage(
      //   c.env.SENDER_ADDRESS,
      //   c.env.RECIPIENT_ADDRESS,
      //   msg.asRaw()
      // );

      // const info = await c.env.SEB.send(message);

      // if (info.accepted) {
      //   console.log("Email sent: ", info.accepted);
      //   return {
      //     success: true,
      //   };
      // } else {
      //   console.log("Email not sent: ", info.rejected);
      //   return {
      //     success: false,
      //   };
      // }
      return {
        success: true,
      };
    } catch (error) {
      console.log("Error: ", error);

      return {
        success: false,
      };
    }
  }
}
