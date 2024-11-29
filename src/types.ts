import { DateTime, Str } from "chanfana";
import { z } from "zod";

export const Task = z.object({
  name: Str({ example: "lorem" }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: DateTime(),
});

export const User = z.object({
  username: Str(),
  email: Str(),
  emailVerified: z.number().default(0),
  profilePictureUrl: Str({ required: true }),
  refreshToken: Str({ required: true }),
});
