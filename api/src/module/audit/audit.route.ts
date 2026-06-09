import express from "express";
import { getLogs } from "./audit.controller";
import { authenticate } from "src/middlewares/authenticate.md";
import { requireRole } from "src/middlewares/authorize.md";

const router = express.Router();

router.route("/logs").get(authenticate, requireRole("ADMIN"), getLogs);

export default router;
