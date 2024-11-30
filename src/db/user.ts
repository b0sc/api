import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const userTable = sqliteTable("user", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  email: text().notNull().unique(),
  password: text(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).default(false),
  profilePictureUrl: text("profilePictureUrl"),
  refreshToken: text("refreshToken"),
  role: text({
    enum: ["audience", "user", "executive", "alumni", "admin"],
  })
    .notNull()
    .default("audience"),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Schema for inserting a user - can be used to validate API requests
const insertUserSchema = createInsertSchema(userTable, {
  id: (schema) => schema.id.nullish(),
  emailVerified: z.boolean(),
  username: z.string(),
});

// Schema for selecting a user - can be used to validate API responses
const selectUserSchema = createSelectSchema(userTable);

export { userTable, insertUserSchema, selectUserSchema };

// Overriding the fields
// const insertUserSchema = createInsertSchema(userTable, {
//   role: z.string(),
// });

// Refining the fields - useful if you want to change the fields before they become nullable/optional in the final schema

// Usage
// const user = insertUserSchema.parse({
//   name: "John Doe",
//   email: "johndoe@test.com",
//   role: "admin",
// });
