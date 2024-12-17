import type { Database } from "./db/db";

import type { DatabaseUserAttributes, Session } from "types";

type Variables = {
  // with c.var
  db: Database;
  user: (DatabaseUserAttributes & { id: string }) | null;
  session: Session | null;
};

export interface AppBindings {
  // with c.env
  Bindings: Env;
  Variables: Variables;
}

type Env = {
  USERNAME: string;
  PASSWORD: string;
  MY_RATE_LIMITER: any;
  DB: D1Database;
  ENVIRONMENT: "production" | "development";
  //   GITHUB_CLIENT_ID: string;
  //   GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  ADMINS: string;
  API_DOMAIN: string;
  WEB_DOMAIN: string;
};
