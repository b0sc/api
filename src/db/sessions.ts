import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { userTable } from "./user";

const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id", { mode: "number" })
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

// const selectSessionSchema = createSelectSchema(sessionTable);

export { sessionTable };
