import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "ok" });
  } catch (err) {
    logger.error({ err }, "health check db failure");
    return NextResponse.json(
      { status: "degraded", db: "unreachable" },
      { status: 503 }
    );
  }
}
