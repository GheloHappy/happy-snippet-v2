import { Request, Response } from 'express';
import * as jose from 'jose';
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    COOKIE_MAX_AGE,
    JWT_EXPIRATION_TIME,
    JWT_SECRET,
    COOKIE_OPTIONS,
    REFRESH_TOKEN_EXPIRY,
    REFRESH_COOKIE_OPTIONS,
} from '../../utils/constants.js';
import { getUsersInfoById, insertUser, User } from 'src/models/users.model.js';

interface GoogleOAuthResponse {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    id_token?: string;
    error?: string;
    error_description?: string;
}

export async function GoogleToken(req: Request, res: Response) {
    const { code, platform = 'native' } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
    }

    let data;

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
                code,
            }),
        });

        data = await response.json() as GoogleOAuthResponse;
    } catch (err) {
        console.error('OAuth Token Exchange Error:', err);
        return res.status(500).json({ error: 'Failed to exchange code for tokens' });
    }

    if (!data.id_token || data.error) {
        return res.status(400).json({
            error: data.error || 'Missing required parameters',
            error_description: data.error_description,
            message:
                'OAuth validation error - please ensure the app complies with Google\'s OAuth 2.0 policy',
        });
    }

    const userInfo = jose.decodeJwt(data.id_token) as any;
    const { exp, ...userInfoWithoutExp } = userInfo;
    const sub = userInfo.sub;
    const issuedAt = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();

    const verify = await getUsersInfoById(sub);

    if (!verify) {
        const insertGoogleUserData = {
            providerUserId: sub,
            email: userInfo.email,
            name: userInfo.name,
            auth: 2,
            authDescription: 'google',
            profilePictureUrl: userInfo.picture,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        const result = await insertUser(insertGoogleUserData as User)

        if (!result.success) {
            return res.status(400).json({ error: 'User registration failed' });
        }
    }

    const accessToken = await new jose.SignJWT(userInfoWithoutExp)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(JWT_EXPIRATION_TIME)
        .setSubject(sub)
        .setIssuedAt(issuedAt)
        .sign(new TextEncoder().encode(JWT_SECRET));

    const refreshToken = await new jose.SignJWT({
        sub,
        jti,
        type: 'refresh',
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        email_verified: userInfo.email_verified,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .setIssuedAt(issuedAt)
        .sign(new TextEncoder().encode(JWT_SECRET));

    if (platform === 'web') {
        // Set cookies using Express helper
        res.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS);
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

        return res.json({
            success: true,
            issuedAt,
            expiresAt: issuedAt + COOKIE_MAX_AGE,
        });
    }
    // Return tokens in body for native clients
    return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
}

export async function RefreshToken(req: Request, res: Response) {
    let { refreshToken } = req.body

    try {
        if (!refreshToken) {
            const authHeader = req.headers["authorization"];
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const accessToken = authHeader.split(" ")[1];

                try {
                    const decoded = await jose.jwtVerify(
                        accessToken,
                        new TextEncoder().encode(JWT_SECRET)
                    );
                    //console.log("No refresh token found, using access token as fallback");
                    const userInfo = decoded.payload;

                    // Current timestamp in seconds
                    const issuedAt = Math.floor(Date.now() / 1000);

                    const newAccessToken = await new jose.SignJWT({ ...userInfo })
                        .setProtectedHeader({ alg: "HS256" })
                        .setExpirationTime(JWT_EXPIRATION_TIME)
                        .setSubject(userInfo.sub as string)
                        .setIssuedAt(issuedAt)
                        .sign(new TextEncoder().encode(JWT_SECRET));

                    return res.json({
                        accessToken: newAccessToken,
                        warning: "Using access token fallback - refresh token missing",
                    });
                } catch (e) {
                    // Access token is invalid or expired
                    return res.json({ error: "Authentication required - no valid refresh token", status: 401 })
                }
            }
        }

        let decoded;

        //verify the refresh token
        try {
            decoded = await jose.jwtVerify(
                refreshToken,
                new TextEncoder().encode(JWT_SECRET)
            );
        } catch (e) {
            if (e instanceof jose.errors.JWTExpired) {
                return res.json(
                    { error: "Refresh token expired, please sign in again", status: 401 }
                );
            } else {
                return res.json(
                    { error: "Invalid refresh token, please sign in again", status: 401 }
                );
            }
        }

        //verify this is actually a refresh token
        const payload = decoded.payload;

        if (payload.type !== "refresh") {
            return res.json(
                { error: "Invalid token type, please sign in again", status: 401 }
            );
        }

        //get the subject (user ID) from the token
        const sub = payload.sub;
        if (!sub) {
            return res.json(
                { error: "Invalid token, missing subject", status: 401 }
            );
        }

        //current timestamp in seconds
        const issuedAt = Math.floor(Date.now() / 1000);

        //generate a unique jti (JWT ID) for the new refresh token
        const jti = crypto.randomUUID();

        //get the user info from the token
        const userInfo = decoded.payload;

        const newAccessToken = await new jose.SignJWT({
            ...userInfo,
            type: undefined,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime(JWT_EXPIRATION_TIME)
            .setSubject(sub)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(JWT_SECRET));

        const newRefreshToken = await new jose.SignJWT({
            ...userInfo,
            jti,
            type: "refresh",
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime(REFRESH_TOKEN_EXPIRY)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(JWT_SECRET));

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            status: 200,
        });
    } catch (e) {
        console.error("Refresh token error:", e);
        return res.json({ error: "Failed to refresh token", status: 500 });
    }
}