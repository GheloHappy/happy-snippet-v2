import { Request, Response } from 'express';
import { APP_SCHEME, BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_OAUTH_URL, GOOGLE_REDIRECT_URI } from "src/utils/constants";

export async function GoogleAuthorize(req: Request, res: Response) {
    if (!GOOGLE_CLIENT_ID) {
        return res.json(
            { error: "GOOGLE_CLIENT_ID is not set", status: 500 }
        );
    }

    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const url = new URL(fullUrl);
    let idpClient: string;

    const internalClient = url.searchParams.get('client_id');
    const redirectUri = url.searchParams.get('redirect_uri');

    let platform;

    if (redirectUri === APP_SCHEME || redirectUri?.startsWith("exp://")) {
        platform = "mobile";
    } else if (redirectUri === BASE_URL) {
        platform = "web";
    } else {
        return res.json({ error: "Invalid redirect_uri", status: 400 });
    }

    let state = platform + "|" + url.searchParams.get('state');

    if (internalClient === "google") {
        idpClient = GOOGLE_CLIENT_ID;
    } else {
        return res.json({ error: "Invalid client", status: 400 });
    }

    const params = new URLSearchParams({
        client_id: idpClient,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: url.searchParams.get("scope") || ("identity"),
        state: state,
        prompt: "select_account",
    });

    return res.redirect(GOOGLE_OAUTH_URL + "?" + params.toString());
}

export const GoogleCallback = async (req: Request, res: Response) => {
    const incomingParams = new URLSearchParams(req.url.split("?")[1]);
    const combinedPlatformAndState = incomingParams.get("state");

    if (!combinedPlatformAndState) {
        return res.json({ error: "State parameter is missing", status: 400 });
    }

    const platform = combinedPlatformAndState.split("|")[0];
    const state = combinedPlatformAndState.split("|")[1];

    const outgoingParams = new URLSearchParams({
        code: incomingParams.get("code")?.toString() || "",
        state,
    });

    return res.redirect(
        (platform === "web" ? BASE_URL : APP_SCHEME) +
        "?" +
        outgoingParams.toString()
    );
}
