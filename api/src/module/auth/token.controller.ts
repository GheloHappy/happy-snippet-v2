import type { Request, Response } from "express";
import * as jose from "jose";
import crypto from "crypto";
import {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
  JWT_SECRET_REFRESH,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_EXPIRY_SEC,
} from "src/config/constants";
import { findUser } from "src/module/user/user.model";

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const platform = req.headers["x-client-type"];
  let refreshToken: string | undefined;

  if (platform === "web") {
    // use cookie (HttpOnly, Secure, SameSite, etc.)
    refreshToken = req.cookies[REFRESH_COOKIE_NAME];
  } else {
    // mobile or external client
    refreshToken = req.body.refresh_token;
  }

  if (!refreshToken) {
    res.status(401).json({ message: "Token expired, please sign in again" });
    return;
  }

  let decoded;

  try {
    // Verify refresh token
    decoded = await jose.jwtVerify(
      refreshToken,
      new TextEncoder().encode(JWT_SECRET_REFRESH),
    );
  } catch (e) {
    if (e instanceof jose.errors.JWTExpired) {
      res
        .status(401)
        .json({ message: "Refresh token expired, please sign in again" });
    } else {
      res
        .status(401)
        .json({ message: "Invalid refresh token, please sign in again" });
    }
    console.error("Error verifying refresh token:", e);
    return;
  }

  const payload = decoded.payload;

  if (payload.type !== "refresh") {
    res
      .status(401)
      .json({ message: "Invalid token type, please sign in again" });
    return;
  }

  const sub = payload.sub;

  if (!sub) {
    res.status(401).json({ message: "Invalid token, missing subject" });
    return;
  }

  //converts to Number
  const userId = Number(payload.sub);

  const user = await findUser({ id: userId });

  if (!user) {
    res.status(401).json({ loggedIn: false, msg: "User not found" });
    return;
  }

  // const sites = await getCompanySites();

  const userData = {
    id: user.id,
    username: user.username,
    name: user.name,
    department: user.department,
    role: user.role,
  };

  try {
    const issuedAt = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();

    // New access token
    const newAccessToken = await new jose.SignJWT(userData)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    // New refresh token
    const newRefreshToken = await new jose.SignJWT({
      sub,
      jti,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(issuedAt + REFRESH_TOKEN_EXPIRY_SEC)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET_REFRESH));

    if (platform === "web") {
      res.cookie(COOKIE_NAME, newAccessToken, COOKIE_OPTIONS);
      res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        message: "Refresh successful",
        success: true,
        userData,
      });
    } else {
      // For mobile clients
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    }
  } catch (err) {
    console.error("Error getting new token:", err);
    res.status(500).json({ message: "Server error renewing token" });
    return;
  }
}

export async function logOutUser(req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
}
