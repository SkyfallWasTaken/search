import * as Sentry from "@sentry/bun";
import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { rateLimiter } from "hono-rate-limiter";
import { db } from "../db";
import { sessions, users } from "../db/schema";
import { env } from "../env";
import type { AppVariables } from "../types";

interface HackClubIdentityResponse {
  identity: {
    id: string;
    slack_id: string;
    primary_email: string;
    first_name: string;
    last_name: string;
    verification_status: string;
    ysws_eligible: boolean;
  };
}

interface HackClubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  created_at: number;
}

const auth = new Hono<{ Variables: AppVariables }>();
auth.use(
  rateLimiter({
    limit: 30,
    windowMs: 10 * 60 * 1000,
    keyGenerator: (c: Context<{ Variables: AppVariables }>) =>
      c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown",
  }),
);

auth.get("/login", (c) => {
  const clientId = env.HACK_CLUB_CLIENT_ID;
  const redirectUri = `${env.BASE_URL}/auth/callback`;
  const authUrl = `https://auth.hackclub.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email+name+slack_id+verification_status`;
  return c.redirect(authUrl);
});

auth.get("/callback", async (c) => {
  console.log("[AUTH] Callback received");
  const code = c.req.query("code");

  if (!code) {
    console.log("[AUTH] No code, redirecting");
    return c.redirect("/");
  }

  try {
    console.log("[AUTH] Exchanging code for token...");
    const tokenUrl = "https://auth.hackclub.com/oauth/token";
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.HACK_CLUB_CLIENT_ID,
      client_secret: env.HACK_CLUB_CLIENT_SECRET,
      code,
      redirect_uri: `${env.BASE_URL}/auth/callback`,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      console.log(await tokenResponse.text());
      throw new HTTPException(400, {
        message: "Failed to exchange code for token",
      });
    }

    const tokenData = (await tokenResponse.json()) as HackClubTokenResponse;
    console.log("[AUTH] Got token, fetching user...");

    const userResponse = await fetch("https://auth.hackclub.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new HTTPException(401, {
        message: "Failed to fetch user identity",
      });
    }

    const userData = (await userResponse.json()) as HackClubIdentityResponse;
    console.log("[AUTH] Got user data, checking slack_id...");
    const { identity } = userData;

    if (!identity.slack_id) {
      throw new HTTPException(400, {
        message: "User does not have a linked Slack account",
      });
    }

    console.log("[AUTH] Looking up user in DB...");
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.slackId, identity.slack_id))
      .limit(1);
    console.log("[AUTH] User lookup complete, found:", !!user);

    const isIdvVerified = identity.ysws_eligible;

    if (!user) {
      console.log("[AUTH] Creating new user...");
      [user] = await db
        .insert(users)
        .values({
          slackId: identity.slack_id,
          email: identity.primary_email,
          name: `${identity.first_name} ${identity.last_name}`.trim(),
          isIdvVerified,
        })
        .returning();
      console.log("[AUTH] User created");
    } else {
      console.log("[AUTH] Updating existing user...");
      [user] = await db
        .update(users)
        .set({
          email: identity.primary_email,
          name: `${identity.first_name} ${identity.last_name}`.trim(),
          isIdvVerified,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      console.log("[AUTH] User updated");
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    console.log("[AUTH] Creating session...");
    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
    });
    console.log("[AUTH] Session created, setting cookie...");

    setCookie(c, "session_token", sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    console.log("[AUTH] Redirecting to dashboard...");
    return c.redirect("/dashboard");
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error("Auth error:", error);
    throw new HTTPException(500, { message: "Authentication error" });
  }
});

auth.post("/logout", async (c) => {
  const sessionToken = getCookie(c, "session_token");

  if (sessionToken) {
    await Sentry.startSpan({ name: "db.delete.session" }, async () => {
      await db.delete(sessions).where(eq(sessions.token, sessionToken));
    });
  }

  setCookie(c, "session_token", "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  });

  return c.redirect("/");
});

export default auth;
