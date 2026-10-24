import { z } from "zod";

const baseUrl = z
  .string()
  .url()
  .transform((s) => s.replace(/\/+$/, ""));

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),

  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  FRONTEND_URL: baseUrl.default("http://localhost:5173"),

  POLOR_ACCESS_TOKEN: z.string().optional(),
  POLOR_WEBHOOK_SECRET: z.string().optional(),
  POLOR_API_BASE: baseUrl.default("https://sandbox-api.polar.sh"),
  POLOR_CHECKOUT_PRODUCT_ID: z.string().uuid(),

  STREAM_API_KEY: z.string().min(1),
  STREAM_API_SECRET: z.string().min(1),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),

  SENTRY_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;
export function loadEnv(): Env {
  // docker-compose passes unset vars as "" (`${VAR:-}`); treat them as missing
  // so .optional() / .default() apply instead of failing validation.
  const raw = Object.fromEntries(
    Object.entries(process.env).filter(([, v]) => v !== ""),
  );
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error(`Invalid environment variables`);
  } 
  return result.data;
}

let cachedEnv: Env | null = null;

export function getEnv():Env {
  if (!cachedEnv) cachedEnv = loadEnv();
  return cachedEnv;
}
