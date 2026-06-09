import { Router } from "express";
import { loginUser } from "./auth.controller";
import { refreshToken, logOutUser } from "./token.controller";

const authRoute = Router();

authRoute.post("/login", loginUser);
authRoute.post("/refresh", refreshToken);
authRoute.post("/logout", logOutUser);

export default authRoute;