"use client";

import * as React from "react";

const DISMISS_KEY = "pwa_dismissed_at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export interface UseInstallPromptResult {
  /** True when the browser fired `beforeinstallprompt` and the app can be installed. */
  canInstall: boolean;
  /** True when the app is already running as an installed PWA (standalone). */
  isInstalled: boolean;
  /** True on iOS Safari, where the native prompt is unavailable. */
  isIOS: boolean;
  /** True when the user dismissed the banner within the last 7 days. */
  dismissed: boolean;
  /** Triggers the native install prompt. No-op on iOS or when nothing is deferred. */
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  /** Persists the dismissal timestamp so the banner stays hidden for 7 days. */
  dismiss: () => void;
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
}

function detectInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number.parseInt(raw, 10);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [canInstall, setCanInstall] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const deferredRef = React.useRef<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
    setIsIOS(detectIOS());
    setIsInstalled(detectInstalled());
    setDismissed(readDismissed());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredRef.current = null;
    };

    const displayMql = window.matchMedia("(display-mode: standalone)");
    const onDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    displayMql.addEventListener("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      displayMql.removeEventListener("change", onDisplayChange);
    };
  }, []);

  const promptInstall = React.useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    const deferred = deferredRef.current;
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setCanInstall(false);
      deferredRef.current = null;
    }
    return choice.outcome;
  }, []);

  const dismiss = React.useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // localStorage may be unavailable (private mode, quota); ignore.
    }
    setDismissed(true);
  }, []);

  return { canInstall, isInstalled, isIOS, dismissed, promptInstall, dismiss };
}
