"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchTo(next: Locale) {
    if (next === locale) return;
    fetch("/api/user/locale", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    }).catch(() => {});
    router.replace(
      // @ts-expect-error -- params are compatible with the current pathname
      { pathname, params },
      { locale: next }
    );
  }

  return (
    <div className="flex gap-1" role="group" aria-label={t("label")}>
      {routing.locales.map((l) => (
        <Button
          key={l}
          size="sm"
          variant={l === locale ? "default" : "outline"}
          onClick={() => switchTo(l)}
        >
          {t(l)}
        </Button>
      ))}
    </div>
  );
}
