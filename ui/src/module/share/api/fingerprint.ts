"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";

// Biến cache toàn cục
let cachedFingerprint: string | null = null;

/**
 * Lấy fingerprint (duy nhất một lần trong toàn bộ phiên)
 */
export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedFingerprint = result.visitorId;

  return cachedFingerprint;
}
