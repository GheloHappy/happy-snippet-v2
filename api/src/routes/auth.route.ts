import express from "express";
import { GoogleAuthorize, GoogleCallback } from "src/controllers/auth-controllers/auth.controller";
import { GoogleToken } from "src/controllers/auth-controllers/token.controller";

const router = express.Router();

router.route(`/authorize`).get(GoogleAuthorize);
router.route(`/callback`).get(GoogleCallback);
router.route(`/token`).post(GoogleToken);

export default router;