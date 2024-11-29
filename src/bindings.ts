import type { Database } from "./db/db";

import type { InferInsertModel } from "drizzle-orm";

import type { userTable } from "./db/user";

export type DatabaseUserAttributes = InferInsertModel<typeof userTable>;
type Variables = {
  // with c.var
  db: Database;
  user: (DatabaseUserAttributes & { id: string }) | null;
  //   session: Session | null;
};

export interface AppBindings {
  // with c.env
  Bindings: Env;
  Variables: Variables;
}

type Env = {
  USERNAME: string;
  PASSWORD: string;
  DB: D1Database;
  WORKER_ENV: "production" | "development";
  //   GITHUB_CLIENT_ID: string;
  //   GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  API_DOMAIN: string;
  WEB_DOMAIN: string;
};
