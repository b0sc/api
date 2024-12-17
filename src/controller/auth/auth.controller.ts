import { zValidator } from "@hono/zod-validator";
import { generateCodeVerifier, generateState } from "arctic";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { getCookie, setCookie } from "hono/cookie";
import { z } from "zod";

import {
  deleteSessionTokenCookie,
  invalidateSession,
  validateSessionToken,
} from "../../auth/oslo-auth";
import { AppBindings } from "bindings";
import { createGoogleSession, getGoogleAuthorizationUrl } from "./google";

const AuthController = new Hono<AppBindings>()
  .get("/logout", async (c) => {
    const sessionToken = getCookie(c, "session");
    if (!sessionToken) {
      return c.json({ error: "Not logged in" }, 400);
    }

    const session = c.get("session");
    if (session) {
      await invalidateSession(c, session.id);
    }
    deleteSessionTokenCookie(c);

    return c.redirect(env(c).API_DOMAIN);
  })
  .get(
    "/:provider",
    zValidator(
      "param",
      z.object({ provider: z.enum(["github", "google", "apple"]) })
    ),
    zValidator(
      "query",
      z.object({
        redirect: z.enum([
          "http://bosc.org.np",
          "https://bosc.org.np",
          "http://localhost:4321",
          "https://api.bosc.org.np",
          "http://api.bosc.org.np",
          "http://localhost:8787",
        ]),
        sessionToken: z.string().optional(),
      })
      // .default({ redirect: "http://localhost:8787" })
    ),
    async (c) => {
      const provider = c.req.valid("param").provider;
      const redirect = c.req.valid("query").redirect;
      const sessionToken = c.req.valid("query").sessionToken;
      setCookie(c, "redirect", redirect, {
        httpOnly: true,
        maxAge: 60 * 10,
        path: "/",
        secure: env(c).ENVIRONMENT === "production",
      });
      if (sessionToken) {
        // validate session using oslo-auth
        const { session, user } = await validateSessionToken(c, sessionToken);
        if (user) {
          // for account linking
          setCookie(c, "sessionToken", sessionToken, {
            httpOnly: true,
            maxAge: 60 * 10, // 10 minutes
            path: "/",
            secure: env(c).ENVIRONMENT === "production",
          });
        }
      }
      const state = generateState();

      if (provider === "google") {
        const codeVerifier = generateCodeVerifier();
        const url = await getGoogleAuthorizationUrl({ c, state, codeVerifier });
        setCookie(c, "google_oauth_state", state, {
          httpOnly: true,
          maxAge: 60 * 10,
          path: "/",
          secure: env(c).ENVIRONMENT === "production",
        });
        setCookie(c, "google_oauth_code_verifier", codeVerifier, {
          httpOnly: true,
          maxAge: 60 * 10,
          path: "/",
          secure: env(c).ENVIRONMENT === "production",
        });
        return c.redirect(url.toString());
      }

      return c.json({}, 400);
    }
  )
  .all(
    "/:provider/callback",
    zValidator(
      "param",
      z.object({ provider: z.enum(["github", "google", "apple"]) })
    ),
    async (c) => {
      try {
        const provider = c.req.valid("param").provider;
        let stateCookie = getCookie(c, `${provider}_oauth_state`);
        // console.log("stateCookie", stateCookie);
        const codeVerifierCookie = getCookie(
          c,
          `${provider}_oauth_code_verifier`
        );
        // console.log("codeVerifierCookie", codeVerifierCookie);

        const sessionTokenCookie = getCookie(c, "sessionToken");
        let redirect = getCookie(c, "redirect");
        // console.log("redirect", redirect);

        const url = new URL(c.req.url);
        let state = url.searchParams.get("state");
        let code = url.searchParams.get("code");
        const codeVerifierRequired = ["google"].includes(provider);
        if (c.req.method === "POST") {
          const formData = await c.req.formData();
          state = formData.get("state") as string;
          stateCookie = state ?? stateCookie;
          code = formData.get("code") as string;
          redirect = env(c).WEB_DOMAIN;
        }
        if (
          !state ||
          !stateCookie ||
          !code ||
          stateCookie !== state ||
          !redirect ||
          (codeVerifierRequired && !codeVerifierCookie)
        ) {
          return c.json({ error: "Invalid request" }, 400);
        }

        if (provider === "google") {
          const session = await createGoogleSession({
            c,
            idToken: code,
            codeVerifier: codeVerifierCookie ?? "",
            sessionToken: sessionTokenCookie,
          });
          if (!session) {
            return c.json({}, 400);
          }
          setCookie(c, "session", session.id, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
            secure: env(c).ENVIRONMENT === "production",
          });
          const redirectUrl = new URL(redirect);
          return c.redirect(redirectUrl.toString());
        }
        return c.json({}, 400);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          console.error(error.stack);
        }
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  );

export { AuthController };
