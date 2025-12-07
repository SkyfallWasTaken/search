import * as Sentry from "@sentry/bun";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import { apiKeys, sessions, users } from "../db/schema";
import { env } from "../env";
import type { AppVariables } from "../types";

export async function requireAuth(
  c: Context<{ Variables: AppVariables }>,
  next: Next,
) {
  return Sentry.startSpan({ name: "middleware.requireAuth" }, async () => {
    const sessionToken = getCookie(c, "session_token");

    if (!sessionToken) {
      return c.redirect("/");
    }

    const [result] = await Sentry.startSpan(
      { name: "db.select.session" },
      async () => {
        return await db
          .select({
            user: users,
          })
          .from(sessions)
          .innerJoin(users, eq(sessions.userId, users.id))
          .where(
            and(
              eq(sessions.token, sessionToken),
              gt(sessions.expiresAt, new Date()),
            ),
          )
          .limit(1);
      },
    );

    if (!result) {
      return c.redirect("/");
    }

    if (result.user.isBanned) {
      throw new HTTPException(403, {
        message: "You are banned from using this service.",
      });
    }

    c.set("user", result.user);
    if (env.SENTRY_DSN) {
      Sentry.setUser({
        email: result.user.email || undefined,
        slackId: result.user.slackId,
        name: result.user.name,
      });
    }
    await next();
  });
}

export async function optionalAuth(
  c: Context<{ Variables: AppVariables }>,
  next: Next,
) {
  const sessionToken = getCookie(c, "session_token");

  if (!sessionToken) {
    await next();
    return;
  }

  const [result] = await Sentry.startSpan(
    { name: "db.select.session" },
    async () => {
      return await db
        .select({
          user: users,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(
          and(
            eq(sessions.token, sessionToken),
            gt(sessions.expiresAt, new Date()),
          ),
        )
        .limit(1);
    },
  );

  if (!result) {
    await next();
    return;
  }

  c.set("user", result.user);
  await next();
}

export async function requireApiKey(
  c: Context<{ Variables: AppVariables }>,
  next: Next,
) {
  return Sentry.startSpan({ name: "middleware.requireApiKey" }, async () => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Authentication required" });
    }

    const key = authHeader.substring(7);

    const [apiKey] = await Sentry.startSpan(
      { name: "db.select.apiKey" },
      async () => {
        return await db
          .select({
            apiKey: apiKeys,
            user: users,
          })
          .from(apiKeys)
          .innerJoin(users, eq(apiKeys.userId, users.id))
          .where(and(eq(apiKeys.key, key), isNull(apiKeys.revokedAt)))
          .limit(1);
      },
    );

    if (!apiKey) {
      throw new HTTPException(401, { message: "Authentication failed" });
    }

    c.set("apiKey", apiKey.apiKey);
    c.set("user", apiKey.user);

    if (apiKey.user.isBanned) {
      throw new HTTPException(403, {
        message: "You are banned from using this service.",
      });
    }

    if (env.ENFORCE_IDV && !apiKey.user.skipIdv && !apiKey.user.isIdvVerified) {
      throw new HTTPException(403, {
        message:
          "Identity verification required. Please verify at https://identity.hackclub.com",
      });
    }

    await next();
  });
}
