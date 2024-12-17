import { AppBindings } from "bindings";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { html } from "hono/html";
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from "hono/cookie";

// admin route
const admin = new Hono<AppBindings>();
admin.use("/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  });
  return auth(c, next);
});
admin.get("/", (c) => {
  return c.text("You are authorized!");
});

const home = new Hono<AppBindings>();
home.get("/", (c) => {
  const domain = c.env.API_DOMAIN;
  const session = getCookie(c, "session");
  let loggedIn = false;
  if (session) {
    loggedIn = true;
  }

  return c.html(`
    <html lang="en">
    ${Header()}
      <body>
        ${Content(loggedIn, domain)}
      </body>
    </html>
    `);
});
const Header = () => html`
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="club, opensource" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.png" />
    <title>BOSC-API</title>
    <meta
      name="description"
      content="BOSC is a club for opensource enthusiasts from Birendra Multiple Campus. This is the BOSC's official website's API."
    />
  </head>
`;

const Content = (loggedIn: boolean, domain: string) => html`
  <div>
    <h1>Welcome to BOSC API</h1>
    <p>
      This is the API for the BOSC website. You can use this API to interact
      with the BOSC website.
    </p>
    <a href="/api">API</a>
    <h1>Login as a Club Executive</h1>

    ${loggedIn ? LogoutContent() : LoginContent(domain)}
  </div>
`;

const LoginContent = (domain: string) => html`
  <div id="login">
    <a href="${domain}/auth/google?redirect=${domain}">
      <img
        src="/google_signin_light.png"
        alt="Sign in with Google"
        height="40"
      />
    </a>
  </div>
`;

const LogoutContent = () => html`
  <div id="logout">
    <button>
      <a href="/auth/logout" style="text-decoration: none; color: black;">
        Logout
      </a>
    </button>
  </div>
`;
export { admin, home };
