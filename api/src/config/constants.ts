function getEnvVar(name: string): string {
  const value = Bun.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable ${name} is not defined or empty`);
  }

  return value;
}

export const PORT = getEnvVar("PORT");

export const ALLOWED_HOSTS = getEnvVar("ALLOWED_HOSTS")
  .split(",")
  .map((host) => host.trim());

// Database Connections
export const DB_PORT = parseInt(Bun.env.DB_PORT || "1433");
export const DB_NAME = getEnvVar("DB_NAME");
export const DB_USER = getEnvVar("DB_USER");
export const DB_PASSWORD = getEnvVar("DB_PASSWORD");
export const DB_SERVER = Bun.env.DB_SERVER || Bun.env.DB_HOST || "localhost";

export const APP_VERSION = "1.0.0";

// Environment Constants
export const JWT_SECRET = getEnvVar("JWT_SECRET");
export const JWT_SECRET_REFRESH = getEnvVar("JWT_SECRET_REFRESH");

export const COOKIE_NAME = "_token";
export const REFRESH_COOKIE_NAME = "_ref_token";

// Token Expiry Settings
export const JWT_EXPIRATION_TIME = "15m"; // 15 minutes
// export const JWT_EXPIRATION_TIME = "5s"; // 5 seconds
// Refresh token expiration (in seconds for jose)
export const REFRESH_TOKEN_EXPIRY_SEC = 30 * 24 * 60 * 60; // 30d
// export const REFRESH_TOKEN_EXPIRY_SEC = 20; // 20 seconds

// Cookie Lifetimes
export const COOKIE_MAX_AGE = 5 * 60 * 1000; // 5 minutes
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30d

const isProd = Bun.env.NODE_ENV === "production";

// Cookie Settings
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: REFRESH_TOKEN_MAX_AGE,
};
