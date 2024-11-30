import { defineConfig } from "drizzle-kit";
import crypto from "node:crypto";

process.env.USE_LOCAL_DB === "true"
  ? console.log("Using local database")
  : console.log("Using cloudflare database");

const uniqueKey = "miniflare-D1DatabaseObject";

export default defineConfig(
  process.env.USE_LOCAL_DB === "true"
    ? {
        schema: "./src/db/schema.ts",
        out: "./migrations",
        dialect: "sqlite",
        dbCredentials: {
          url: getPath(),
        },
      }
    : {
        schema: "./src/db/schema.ts",
        out: "./migrations",
        dialect: "sqlite",
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
          databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
          token: process.env.CLOUDFLARE_D1_TOKEN!,
        },
      }
);

function getPath() {
  let path = process.env.LOCAL_DB_PATH!;
  if (path == undefined) {
    path = `./.wrangler/state/v3/d1/${uniqueKey}/${durableObjectNamespaceIdFromName(
      "ACCOUNTS"
    )}.sqlite`;
  }
  console.log("LocalPath: ", path);
  return path;
}

function durableObjectNamespaceIdFromName(name: string) {
  const key = crypto.createHash("sha256").update(uniqueKey).digest();
  const nameHmac = crypto
    .createHmac("sha256", key)
    .update(name)
    .digest()
    .subarray(0, 16);
  const hmac = crypto
    .createHmac("sha256", key)
    .update(nameHmac)
    .digest()
    .subarray(0, 16);
  return Buffer.concat([nameHmac, hmac]).toString("hex");
}
