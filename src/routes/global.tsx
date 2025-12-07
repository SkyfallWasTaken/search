import * as Sentry from "@sentry/bun";
import { desc, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { requestLogs } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import type { AppVariables } from "../types";
import { Global } from "../views/global";

const global = new Hono<{ Variables: AppVariables }>();

global.get("/", requireAuth, async (c) => {
  const user = c.get("user");

  const globalStats = await Sentry.startSpan(
    { name: "db.select.globalStats" },
    async () => {
      return await db
        .select({
          totalRequests: sql<number>`COUNT(*)::int`,
        })
        .from(requestLogs);
    },
  );

  const endpointStats = await Sentry.startSpan(
    { name: "db.select.endpointStats" },
    async () => {
      return await db
        .select({
          endpoint: requestLogs.endpoint,
          totalRequests: sql<number>`COUNT(*)::int`,
        })
        .from(requestLogs)
        .groupBy(requestLogs.endpoint)
        .orderBy(desc(sql<number>`COUNT(*)`));
    },
  );

  return c.html(
    <Global
      user={user}
      globalStats={
        globalStats[0] || {
          totalRequests: 0,
        }
      }
      endpointStats={endpointStats}
    />,
  );
});

export default global;
