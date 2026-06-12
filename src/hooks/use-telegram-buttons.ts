"use client";

import { useEffect } from "react";

export function useBackButton(onClick: () => void, visible = true) {
  useEffect(() => {
    const bb = window.Telegram?.WebApp?.BackButton;
    if (!bb) return;
    if (visible) bb.show();
    else bb.hide();
    bb.onClick(onClick);
    return () => {
      bb.offClick(onClick);
      bb.hide();
    };
  }, [onClick, visible]);
}

export function useMainButton(
  text: string,
  onClick: () => void,
  { visible = true, enabled = true } = {}
) {
  useEffect(() => {
    const mb = window.Telegram?.WebApp?.MainButton;
    if (!mb) return;
    mb.setParams({ text, is_visible: visible, is_active: enabled });
    mb.onClick(onClick);
    return () => {
      mb.offClick(onClick);
      mb.hide();
    };
  }, [text, onClick, visible, enabled]);
}
