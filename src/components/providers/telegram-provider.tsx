"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface TgContext {
  ready: boolean;
  authenticated: boolean;
  insideTelegram: boolean;
}

const TelegramContext = createContext<TgContext>({
  ready: false,
  authenticated: false,
  insideTelegram: false,
});

export const useTelegram = () => useContext(TelegramContext);

function syncTheme() {
  const tp = window.Telegram?.WebApp?.themeParams ?? {};
  const root = document.documentElement;
  const map: Record<string, string | undefined> = {
    "--background": tp.bg_color,
    "--foreground": tp.text_color,
    "--card": tp.secondary_bg_color,
    "--primary": tp.button_color,
    "--primary-foreground": tp.button_text_color,
    "--muted-foreground": tp.hint_color,
    "--destructive": tp.destructive_text_color,
    "--border": tp.section_separator_color,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v) root.style.setProperty(k, v);
  }
  root.classList.toggle(
    "dark",
    window.Telegram?.WebApp?.colorScheme === "dark"
  );
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TgContext>({
    ready: false,
    authenticated: false,
    insideTelegram: false,
  });

  useEffect(() => {
    const wa = window.Telegram?.WebApp;
    if (!wa?.initData) {
      setState({ ready: true, authenticated: false, insideTelegram: false });
      return;
    }
    wa.ready();
    wa.expand();
    syncTheme();
    wa.onEvent("themeChanged", syncTheme);

    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: wa.initData }),
    })
      .then((r) =>
        setState({ ready: true, authenticated: r.ok, insideTelegram: true })
      )
      .catch(() =>
        setState({ ready: true, authenticated: false, insideTelegram: true })
      );

    return () => wa.offEvent("themeChanged", syncTheme);
  }, []);

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
}
