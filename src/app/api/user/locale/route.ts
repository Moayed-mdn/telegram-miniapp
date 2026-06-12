import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { verifySession } from "@/lib/auth/session";

export const runtime = "nodejs";

const BodySchema = z.object({ locale: z.enum(["en", "ar"]) });

export async function PATCH(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = BodySchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.sub },
      data: { locale: body.data.locale },
    });

    return NextResponse.json({ locale: body.data.locale });
  } catch (err) {
    logger.error({ err }, "user/locale failed");
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
