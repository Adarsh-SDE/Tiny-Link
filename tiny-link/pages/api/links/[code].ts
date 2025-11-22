import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (typeof code !== "string") {
    return res.status(400).json({ error: "Invalid code" });
  }

  if (req.method === "GET") {
    try {
      const result = await query(
        "SELECT code, url, total_clicks, last_clicked_at, created_at FROM links WHERE code = $1",
        [code]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.status(200).json(result.rows[0]);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const result = await query("DELETE FROM links WHERE code = $1", [code]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.status(204).end();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).end("Method Not Allowed");
}
