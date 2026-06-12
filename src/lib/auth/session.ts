import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export interface SessionPayload {
  sub: string;
  tgId: string;
}

export async function verifySession(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_JWT_SECRET!)
    );
    if (typeof payload.sub !== "string" || typeof payload.tgId !== "string") {
      return null;
    }
    return { sub: payload.sub, tgId: payload.tgId };
  } catch {
    return null;
  }
}
