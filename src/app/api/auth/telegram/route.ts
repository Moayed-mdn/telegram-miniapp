import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { z } from "zod";
import { validateInitData } from "@/lib/telegram/validate-init-data";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const BodySchema = z.object({ initData: z.string().min(1).max(8192) });

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (!rateLimit(`auth:${ip}`)) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    const body = BodySchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    const validated = validateInitData(
      body.data.initData,
      process.env.TELEGRAM_BOT_TOKEN!,
      Number(process.env.INITDATA_MAX_AGE_SECONDS ?? 3600)
    );

    if (!validated) {
      logger.warn({ ip }, "initData rejected");
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { user } = validated;

    const dbUser = await prisma.user.upsert({
      where: { telegramId: BigInt(user.id) },
      update: {
        firstName: user.first_name,
        lastName: user.last_name ?? null,
        username: user.username ?? null,
        languageCode: user.language_code ?? null,
        photoUrl: user.photo_url ?? null,
        lastSeenAt: new Date(),
      },
      create: {
        telegramId: BigInt(user.id),
        firstName: user.first_name,
        lastName: user.last_name ?? null,
        username: user.username ?? null,
        languageCode: user.language_code ?? null,
        photoUrl: user.photo_url ?? null,
        locale: user.language_code === "ar" ? "ar" : "en",
      },
    });

    const token = await new SignJWT({ sub: dbUser.id, tgId: user.id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode(process.env.SESSION_JWT_SECRET!));

    const res = NextResponse.json({
      user: {
        id: dbUser.id,
        firstName: dbUser.firstName,
        username: dbUser.username,
        locale: dbUser.locale,
      },
    });
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch (err) {
    logger.error({ err }, "auth/telegram failed");
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
