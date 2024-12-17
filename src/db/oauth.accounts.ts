import {
  primaryKey,
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

import { userTable } from "./user";

export const oauthAccountTable = sqliteTable(
  "oauth_account",
  {
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull().unique(),
    userId: integer("user_id", { mode: "number" })
      .notNull()
      .references(() => userTable.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
  })
);
