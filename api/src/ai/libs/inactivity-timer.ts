// src/utils/inactivity-timer.ts
export function createInactivityTimer(delay: number, onTimeout: () => void) {
  let timeoutId: NodeJS.Timeout | null = null;

  function reset() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      onTimeout();
    }, delay);
  }

  function stop() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
  }

  return { reset, stop };
}
