import * as Sentry from "@sentry/bun";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { db } from "../db";
import { apiKeys, requestLogs, sessions } from "../db/schema";
import { env } from "../env";
import { requireAuth } from "../middleware/auth";
import type { AppVariables } from "../types";
import { Dashboard } from "../views/dashboard";
import { Home } from "../views/home";

const dashboard = new Hono<{ Variables: AppVariables }>();

dashboard.get("/", async (c) => {
  const sessionToken = getCookie(c, "session_token");

  if (sessionToken) {
    const [session] = await Sentry.startSpan(
      { name: "db.select.session" },
      async () => {
        return await db
          .select()
          .from(sessions)
          .where(
            and(
              eq(sessions.token, sessionToken),
              gt(sessions.expiresAt, new Date()),
            ),
          )
          .limit(1);
      },
    );

    if (session) {
      return c.redirect("/dashboard");
    }
  }

  return c.html(<Home />);
});

dashboard.get("/dashboard", requireAuth, async (c) => {
  const user = c.get("user");

  const keys = await Sentry.startSpan(
    { name: "db.select.apiKeys" },
    async () => {
      return await db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          createdAt: apiKeys.createdAt,
          keyPreview: sql<string>`CONCAT(SUBSTRING(${apiKeys.key}, 1, 24), '...')`,
        })
        .from(apiKeys)
        .where(and(eq(apiKeys.userId, user.id), isNull(apiKeys.revokedAt)))
        .orderBy(desc(apiKeys.createdAt));
    },
  );

  const stats = await Sentry.startSpan(
    { name: "db.select.userStats" },
    async () => {
      return await db
        .select({
          totalRequests: sql<number>`COUNT(*)::int`,
        })
        .from(requestLogs)
        .where(eq(requestLogs.userId, user.id));
    },
  );

  const recentLogs = await Sentry.startSpan(
    { name: "db.select.recentLogs" },
    async () => {
      return await db
        .select({
          id: requestLogs.id,
          endpoint: requestLogs.endpoint,
          timestamp: requestLogs.timestamp,
          duration: requestLogs.duration,
          ip: requestLogs.ip,
        })
        .from(requestLogs)
        .where(eq(requestLogs.userId, user.id))
        .orderBy(desc(requestLogs.timestamp))
        .limit(50);
    },
  );

  return c.html(
    <Dashboard
      user={user}
      apiKeys={keys}
      stats={
        stats[0] || {
          totalRequests: 0,
        }
      }
      recentLogs={recentLogs}
      enforceIdv={env.ENFORCE_IDV || false}
    />,
  );
});

export default dashboard;
