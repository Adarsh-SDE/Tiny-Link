import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../lib/db";
import { CODE_REGEX, generateUniqueCode, isValidUrl } from "../../../lib/links";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { url, code: customCode } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let code: string | undefined = customCode;
    if (code && !CODE_REGEX.test(code)) {
      return res.status(400).json({ error: "Code must match [A-Za-z0-9]{6,8}" });
    }

    try {
      if (code) {
        const existing = await query("SELECT 1 FROM links WHERE code = $1", [code]);
        if (existing.rowCount > 0) {
          return res.status(409).json({ error: "Code already exists" });
        }
      } else {
        code = await generateUniqueCode();
      }

      const insert = await query(
        "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING code, url, total_clicks, last_clicked_at, created_at",
        [code, url]
      );

      return res.status(201).json(insert.rows[0]);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await query(
        "SELECT code, url, total_clicks, last_clicked_at, created_at FROM links ORDER BY created_at DESC"
      );
      return res.status(200).json(result.rows);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
