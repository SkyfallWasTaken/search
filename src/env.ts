import { type } from "arktype";

const envSchema = type({
  DATABASE_URL: "string",
  BASE_URL: "string",
  PORT: "string.numeric.parse",
  HACK_CLUB_CLIENT_ID: "string",
  HACK_CLUB_CLIENT_SECRET: "string",
  BRAVE_SEARCH_API_KEY: "string",
  NODE_ENV: "'development' | 'production' | 'test' = 'development'",
  "ENFORCE_IDV?": type("'true' | 'false'").pipe((val) => val === "true"),
  "SENTRY_DSN?": "string",
});

const result = envSchema(process.env);

if (result instanceof type.errors) {
  console.error("Environment validation failed:");
  console.error(result.summary);
  process.exit(1);
}

export const env = result;
