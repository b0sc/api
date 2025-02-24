import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";

import type { AppBindings } from "../bindings";
import * as schema from "./schema";

export const initalizeDB = (c: Context<AppBindings>) => {
  let db = c.get("db");
  if (!db) {
    db = drizzle(c.env.DB, { schema });
    c.set("db", db);
  }
  return db;
};

export type Database = DrizzleD1Database<typeof schema>;
