import type { Request, Response } from "express";
import { verifyPassword } from "src/module/user/user.model";
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
import * as jose from "jose";
import { logAction } from "src/module/audit/audit.controller";

export const loginUser = async (
  req: Request<any, any, { username: string; password: string }>,
  res: Response,
): Promise<void> => {
  try {
    const platform = req.headers["x-client-type"] as string;
    const { username, password } = req.body;

    const user = await verifyPassword(username, password);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }


    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      department: user.department,
      role: user.role,
    };

    const issuedAt = Math.floor(Date.now() / 1000);
    const sub = user.id!.toString();
    const jti = crypto.randomUUID();

    const accessToken = await new jose.SignJWT(userData)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const refreshToken = await new jose.SignJWT({
      sub,
      jti,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(issuedAt + REFRESH_TOKEN_EXPIRY_SEC)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET_REFRESH));

    if (platform === "web") {
      res.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS);
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

      logAction(user.id, user.username, "LOGIN", "users", user.id).catch(console.error);

      res.status(200).json({
        message: "Login successful",
        user: userData,
      });
      return;
    }

    logAction(user.id, user.username, "LOGIN", "users", user.id).catch(console.error);

    res.status(200).json({
      message: "Login successful",
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
