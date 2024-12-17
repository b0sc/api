import type { InferInsertModel } from "drizzle-orm";

import type { SelectUser, InsertUser } from "./db/user";

// todo: error with insertuser available fields, file:types.ts, user/userCreate.ts, auth/google.ts, db/user.ts
// when using insertuser, the available fields are only username and email
// but the user table has more fields
// when that is fixed, replace the SelectUser with InsertUser
export type DatabaseUserAttributes = SelectUser;

export interface Session {
  id: string;
  userId: number;
  expiresAt: number;
}

export interface SessionValidationResult {
  session: Session | null;
  user: (DatabaseUserAttributes & { id: string }) | null;
}
