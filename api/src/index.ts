import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { ALLOWED_HOSTS, PORT, APP_VERSION } from "src/config/constants";
import cookieParser from "cookie-parser";

import authRoute from "src/module/auth/auth.route";

const app = express();

app.use(cookieParser());

const allowedOrigins = ALLOWED_HOSTS;

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked for origin: ", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "platform", "x-client-type"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(cookieParser());

app.use("/api/v1/auth", authRoute);

app.get("/api/version", (req: Request, res: Response) => {
  res.json({ version: APP_VERSION });
});

app.get("/", (req: Request, res: Response) => {
  return res.send("If you see this message. API IS WORKING!!");
});

app.listen(PORT, () => {
  console.log(`Server is now running on PORT: ${PORT}`);
});
