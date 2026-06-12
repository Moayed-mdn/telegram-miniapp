"use client";

import { useTranslations } from "next-intl";
import { useTelegram } from "@/components/providers/telegram-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const t = useTranslations();
  const { ready, authenticated, insideTelegram } = useTelegram();

  if (!ready) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full max-w-sm" />
        <p className="text-sm text-muted-foreground">{t("auth.authenticating")}</p>
      </main>
    );
  }

  if (!insideTelegram) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("fallback.title")}</CardTitle>
            <CardDescription>{t("fallback.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="https://telegram.org" target="_blank" rel="noreferrer">
                {t("fallback.cta")}
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("home.heading")}</h1>
        <LocaleSwitcher />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {authenticated ? t("home.description") : t("auth.failed")}
          </CardTitle>
        </CardHeader>
      </Card>
    </main>
  );
}
