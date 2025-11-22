import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Try DB request (simple ping query)
    await query("SELECT 1");

    return res.status(200).json({
      ok: true,
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      status: "unhealthy",
      database: "not connected",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  }
}
