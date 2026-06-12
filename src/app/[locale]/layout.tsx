import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import { routing, isRtl } from "@/i18n/routing";
import { TelegramProvider } from "@/components/providers/telegram-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return { title: t("title") };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const rtl = isRtl(locale);
  const fontVars = rtl
    ? `${geistSans.variable} ${notoSansArabic.variable}`
    : geistSans.variable;

  return (
    <html
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      className={fontVars}
      suppressHydrationWarning
    >
      <body
        className={`bg-background text-foreground antialiased ${
          rtl ? "font-[family-name:var(--font-noto-arabic)]" : ""
        }`}
      >
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <NextIntlClientProvider>
          <TelegramProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </TelegramProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
