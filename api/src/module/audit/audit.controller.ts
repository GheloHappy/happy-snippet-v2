import type { Request, Response } from "express";
import { executeQuery } from "src/db";

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
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const phDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    await executeQuery(
      `INSERT INTO audit_logs (user_id, username, action, table_name, record_id, old_values, new_values, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId ?? null, username ?? null, action, table, recordId ?? null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null, phDateStr],
    );
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
    const total = countResult.rows[0].total;

    const dataResult = await executeQuery(
      `SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS _row_num
        FROM audit_logs
      ) AS _paginated WHERE _row_num > $1 AND _row_num <= $1 + $2`,
      [offset, limitNum],
    );

    res.status(200).json({
      data: dataResult.rows,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("getLogs", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
