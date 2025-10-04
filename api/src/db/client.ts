import pkg from "pg";
const { Pool } = pkg;
import type { Pool as PgPoolType } from "pg";

import { database, user, password, server } from "../utils/constants.js";

let poolInstance: PgPoolType | null = null;

export async function getClient() {
  if (!poolInstance) {
    poolInstance = new Pool({
      host: server,
      user,
      password,
      database,
      port: 5432,
      max: 20, // number of connections in pool (tune this)
      idleTimeoutMillis: 30000, // 30s before releasing idle clients
    });

    poolInstance.on("connect", () => {
      console.log("PostgreSQL pool connected successfully.");
    });

    poolInstance.on("error", (err) => {
      console.error("Unexpected PostgreSQL pool error:", err);
    });
  }

  return poolInstance;
}