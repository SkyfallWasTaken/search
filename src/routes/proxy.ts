import * as Sentry from "@sentry/bun";
import { eq, sql } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { etag } from "hono/etag";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { rateLimiter } from "hono-rate-limiter";
import { db } from "../db";
import { requestLogs } from "../db/schema";
import { env } from "../env";
import { requireApiKey } from "../middleware/auth";
import type { AppVariables } from "../types";

const BRAVE_API_BASE = "https://api.search.brave.com/res/v1";

const ENDPOINTS = {
  web: `${BRAVE_API_BASE}/web/search`,
  images: `${BRAVE_API_BASE}/images/search`,
  videos: `${BRAVE_API_BASE}/videos/search`,
  news: `${BRAVE_API_BASE}/news/search`,
  suggest: `${BRAVE_API_BASE}/suggest/search`,
} as const;

type EndpointType = keyof typeof ENDPOINTS;

function getBraveHeaders(endpoint: EndpointType): Record<string, string> {
  const apiKey =
    endpoint === "suggest"
      ? env.BRAVE_SUGGESTIONS_API_KEY
      : env.BRAVE_SEARCH_API_KEY;

  return {
    Accept: "application/json",
    "Accept-Encoding": "gzip",
    "X-Subscription-Token": apiKey,
  };
}

function buildSearchUrl(
  baseUrl: string,
  params: Record<string, unknown>,
): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function getRequestHeaders(c: Context): Record<string, string> {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

function validateQuery(q: string | undefined): void {
  if (!q || q.trim() === "") {
    throw new HTTPException(400, {
      message: "Query parameter 'q' is required",
    });
  }
  if (q.length > 400) {
    throw new HTTPException(400, {
      message: "Query exceeds 400 character limit",
    });
  }
}

async function logRequest(
  apiKeyId: string,
  userId: string,
  slackId: string,
  endpoint: EndpointType,
  request: Record<string, unknown>,
  response: unknown,
  headers: Record<string, string>,
  ip: string,
  duration: number,
): Promise<void> {
  Sentry.startSpan({ name: "db.insert.requestLog" }, async () => {
    await db
      .insert(requestLogs)
      .values({
        apiKeyId,
        userId,
        slackId,
        endpoint,
        request,
        response,
        headers,
        ip,
        timestamp: new Date(),
        duration,
      })
      .catch((err) => console.error("Logging error:", err));
  });
}

function handleSearchRequest(endpoint: EndpointType) {
  return async (c: Context<{ Variables: AppVariables }>) => {
    const apiKey = c.get("apiKey");
    const user = c.get("user");
    const queryParams = c.req.query();
    const startTime = Date.now();

    try {
      validateQuery(queryParams.q as string | undefined);

      const searchUrl = buildSearchUrl(ENDPOINTS[endpoint], queryParams);

      const response = await fetch(searchUrl, {
        method: "GET",
        headers: getBraveHeaders(endpoint),
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      await logRequest(
        apiKey.id,
        user.id,
        user.slackId,
        endpoint,
        queryParams,
        responseData,
        getRequestHeaders(c),
        c.get("ip"),
        duration,
      );

      return c.json(responseData, response.status as ContentfulStatusCode);
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof HTTPException) {
        throw error;
      }

      console.error(`${endpoint} search proxy error:`, error);

      await logRequest(
        apiKey.id,
        user.id,
        user.slackId,
        endpoint,
        {},
        { error: error instanceof Error ? error.message : "Unknown error" },
        getRequestHeaders(c),
        c.get("ip"),
        duration,
      );

      throw new HTTPException(500, { message: "Internal server error" });
    }
  };
}

const proxy = new Hono<{ Variables: AppVariables }>();

proxy.use(
  "*",
  bodyLimit({
    maxSize: 1 * 1024 * 1024,
    onError: () => {
      throw new HTTPException(413, { message: "Request too large" });
    },
  }),
  timeout(60000),
  (c, next) => {
    let cfIp = c.req.header("CF-Connecting-IP");
    if (!cfIp && env.NODE_ENV !== "development") {
      // throw new HTTPException(400, {
      //   message:
      //     "Missing CF-Connecting-IP. This is a bug. Please contact support.",
      // });
      cfIp = c.req.header("X-Forwarded-For");
    }
    c.set("ip", cfIp || "127.0.0.1");
    return next();
  },
);

const limiterOpts = {
  limit: 200,
  windowMs: 30 * 60 * 1000,
  standardHeaders: "draft-6",
  keyGenerator: (c: Context<{ Variables: AppVariables }>) =>
    c.get("user")?.id || c.get("ip"),
} as const;
const standardLimiter = rateLimiter(limiterOpts);

proxy.use(requireApiKey, etag(), standardLimiter);
proxy.get("/web/search", handleSearchRequest("web"));
proxy.get("/images/search", handleSearchRequest("images"));
proxy.get("/videos/search", handleSearchRequest("videos"));
proxy.get("/news/search", handleSearchRequest("news"));
proxy.get("/suggest/search", handleSearchRequest("suggest"));

export default proxy;
