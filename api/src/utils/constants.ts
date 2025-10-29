import 'dotenv/config';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable ${name} is not defined or empty`);
  }
  return value;
}

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const GOOGLE_REDIRECT_URI = `${process.env.BACKEND_URL}/api/auth/callback`;
export const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const PORT = getEnvVar('PORT');

export const database = getEnvVar('MY_DB');
export const user = getEnvVar('MY_DB_USER');
export const password = getEnvVar('MY_DB_PASSWORD');
export const server = getEnvVar('MY_DB_SERVER');

export const APP_SCHEME = getEnvVar('EXPO_PUBLIC_SCHEME');
export const BASE_URL = getEnvVar('EXPO_PUBLIC_BASE_URL');

// Environment Constants
export const JWT_SECRET = getEnvVar('JWT_SECRET');
export const JWT_SECRET_REFRESH = getEnvVar('JWT_SECRET_REFRESH');

export const COOKIE_NAME = "_snippet";
export const REFRESH_COOKIE_NAME = "_snippet_ref_token";

// Token Expiry Settings
export const JWT_EXPIRATION_TIME = "15m"; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = "30d"; // 30 days

// Cookie Lifetimes
export const COOKIE_MAX_AGE = 5 * 60 * 1000; // 5 minutes
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30d

// Refresh token expiration (in seconds for jose)
export const REFRESH_TOKEN_EXPIRY_SEC = 30 * 24 * 60 * 60; // 30d

const isProd = process.env.NODE_ENV === "development";

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

// export const AUTH_ROLES = {
//   ADMIN: { id: 1, description: "admin" },
//   CUSTOMER: { id: 2, description: "customer" },
//   SALESMAN: { id: 3, description: "salesman" },
// };