"use client";

import { CaptchaStatus, useAuthStore } from "@adapter/auth/auth.store";
import React, { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
        }
      ) => void;
      reset: (widgetId?: number) => void;
    };
  }
}

export default function TurnstileWidget() {
  const captcha = useAuthStore((s) => s.captcha);
  const setCaptcha = useAuthStore((s) => s.setCaptcha);
  const hasRenderedRef = useRef(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  const handleVerify = useCallback(
    (token: string) => {
      setCaptcha({
        status: CaptchaStatus.Success,
        token,
      });
    },
    [setCaptcha]
  );

  useEffect(() => {
    const loadTurnstile = () => {
      if (window.turnstile && widgetRef.current && !hasRenderedRef.current) {
        hasRenderedRef.current = true;
        window.turnstile.render(widgetRef.current, {
          sitekey: "0x4AAAAAABeOBlfY1H_Gtejl",
          callback: handleVerify,
        });
      }
    };

    if (!window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = loadTurnstile;
    } else {
      loadTurnstile();
    }
  }, [captcha, handleVerify]);

  if (captcha.status === CaptchaStatus.Unchecked) return null;

  return (
    <div>
      <div ref={widgetRef}></div>
    </div>
  );
}
