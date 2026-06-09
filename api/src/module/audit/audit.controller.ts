import type { Request, Response } from "express";
import { executeQuery, getPool } from "src/db";

export const logAction = async (
  userId: number | undefined,
  username: string | undefined,
  action: string,
  table: string,
  recordId: number | undefined,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
) => {
  try {
    const pool = await getPool();
    const request = pool.request();

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const phDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    request.input("user_id", userId ?? null);
    request.input("username", username ?? null);
    request.input("action", action);
    request.input("table_name", table);
    request.input("record_id", recordId ?? null);
    request.input("old_values", oldValues ? JSON.stringify(oldValues) : null);
    request.input("new_values", newValues ? JSON.stringify(newValues) : null);
    request.input("created_at", phDateStr);

    await request.query(`
      INSERT INTO audit_logs (user_id, username, action, table_name, record_id, old_values, new_values, created_at)
      VALUES (@user_id, @username, @action, @table_name, @record_id, @old_values, @new_values, @created_at)
    `);
  } catch (error) {
    console.error("logAction error:", error);
  }
};

export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "100" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit as string, 10) || 100));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await executeQuery("SELECT COUNT(*) AS total FROM audit_logs");
    const total = countResult.recordset[0].total;

    const dataResult = await executeQuery(
      `SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS _row_num
        FROM audit_logs
      ) AS _paginated WHERE _row_num > @offset AND _row_num <= @offset + @limit`,
      [
        { name: "offset", type: undefined, value: offset },
        { name: "limit", type: undefined, value: limitNum },
      ],
    );

    res.status(200).json({
      data: dataResult.recordset,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("getLogs", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
