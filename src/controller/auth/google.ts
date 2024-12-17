import { generateRandomString } from "@oslojs/crypto/random";
import type { RandomReader } from "@oslojs/crypto/random";
import { Google, decodeIdToken } from "arctic";
import type { Context } from "hono";
import { env } from "hono/adapter";

import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
  validateSessionToken,
} from "../../auth/oslo-auth";
import type { AppBindings } from "bindings";
import { oauthAccountTable } from "../../db/oauth.accounts";
import { userTable } from "../../db/user";
import type { DatabaseUserAttributes } from "../../types";
import { fetchRefreshToken } from "../user/user.controller";

const googleClient = (c: Context<AppBindings>) =>
  new Google(
    env(c).GOOGLE_CLIENT_ID,
    env(c).GOOGLE_CLIENT_SECRET,
    `${env(c).API_DOMAIN}/auth/google/callback`
  );

const getGoogleAuthorizationUrl = async ({
  c,
  state,
  codeVerifier,
}: {
  c: Context<AppBindings>;
  state: string;
  codeVerifier: string;
}) => {
  const google = googleClient(c);
  const url = await google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);
  url.searchParams.append("prompt", "consent");
  url.searchParams.append("access_type", "offline");
  return url.toString();
};

interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  picture: string;
}
const createGoogleSession = async ({
  c,
  idToken,
  codeVerifier,
  sessionToken,
}: {
  c: Context<AppBindings>;
  idToken: string;
  codeVerifier: string;
  sessionToken?: string;
}) => {
  try {
    const google = googleClient(c);

    const tokens = await google.validateAuthorizationCode(
      idToken,
      codeVerifier
    );
    // console.log("here", { tokens });
    // const claims = decodeIdToken(tokens.idToken());
    // console.log("claims", { claims });

    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      }
    );

    // if (!response.ok) {
    //   throw new Error("Failed to fetch user info from Google");
    // }
    const user: GoogleUser = (await response.json()) as GoogleUser;
    // console.log("user", { user });
    const existingAccount = await c.get("db").query.oauthAccount.findFirst({
      where: (account, { eq }) =>
        eq(account.providerUserId, user.sub.toString()),
    });
    let existingUser: DatabaseUserAttributes | null = null;
    if (sessionToken) {
      const { session, user } = await validateSessionToken(c, sessionToken);
      if (user) {
        existingUser = user as DatabaseUserAttributes;
      }
    } else {
      const response = await c.get("db").query.user.findFirst({
        where: (u, { eq }) => eq(u.email, user.email),
      });
      if (response) {
        existingUser = response;
      }
    }
    if (
      existingUser?.emailVerified &&
      user.email_verified &&
      !existingAccount
    ) {
      await c.get("db").insert(oauthAccountTable).values({
        providerUserId: user.sub,
        provider: "google",
        userId: existingUser.id,
      });
      const token = generateSessionToken();
      const session = await createSession(c, token, existingUser.id);
      setSessionTokenCookie(c, token, session.expiresAt);
      return session;
    }

    if (existingAccount) {
      const token = generateSessionToken();
      const session = await createSession(c, token, existingAccount.userId);
      setSessionTokenCookie(c, token, session.expiresAt);
      return session;
    }

    let username = user.name;
    const existingUsername = await c.get("db").query.user.findFirst({
      where: (u, { eq }) => eq(u.username, username),
    });
    if (existingUsername) {
      username = `${username}-${generateRandomString(
        random,
        "abcdefghijklmnopqrstuvwxyz0123456789",
        5
      )}`;
    }

    let role = "audience";
    c.env.ADMINS.split(",").forEach((admin_mail) => {
      if (user.email === admin_mail) {
        role = "admin";
      }
    });

    // todo: error with insertuser available fields, file:types.ts, user/userCreate.ts, auth/google.ts, db/user.ts
    // issue that is also in create user
    // the createuser schema only has username and email somehow and not the other fields
    await c
      .get("db")
      .insert(userTable)
      .values({
        username,
        email: user.email,
        emailVerified: user.email_verified,
        profilePictureUrl: user.picture,
        refreshToken: tokens.refreshToken() ?? "",
        role,
      });
    const newUser = await c.get("db").query.user.findFirst({
      where: (u, { eq }) => eq(u.email, user.email),
    });
    if (!newUser) {
      throw new Error("Failed to create user");
    }
    await c.get("db").insert(oauthAccountTable).values({
      providerUserId: user.sub,
      provider: "google",
      userId: newUser.id,
    });
    const token = generateSessionToken();
    const session = await createSession(c, token, newUser.id);
    setSessionTokenCookie(c, token, session.expiresAt);
    return session;
  } catch (error) {
    console.log("error: ", error);
    return error;
  }
};

const getAccessToken = async (c: Context<AppBindings>) => {
  const google = googleClient(c);
  const refreshToken = await fetchRefreshToken(c, c.get("user")?.id ?? "");
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }
  const tokens = await google.refreshAccessToken(refreshToken);
  return tokens.accessToken;
};

const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes);
  },
};

export {
  getGoogleAuthorizationUrl,
  createGoogleSession,
  getAccessToken,
  googleClient,
};
