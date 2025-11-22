import { query } from "./db";

export const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return !!u.protocol && !!u.hostname;
  } catch {
    return false;
  }
}

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateCode(length: number = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return result;
}

export async function generateUniqueCode(): Promise<string> {
  while (true) {
    const code = generateCode(6);
    const existing = await query("SELECT 1 FROM links WHERE code = $1", [code]);
    if (existing.rowCount === 0) return code;
  }
}
