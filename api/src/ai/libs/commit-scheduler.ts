// src/utils/commit-scheduler.ts
export function createCommitScheduler() {
  type Entry = { timeout: NodeJS.Timeout; fn: () => Promise<void> };

  const map = new Map<string, Entry>();

  return {
    /**
     * Schedule (or reschedule) a commit function for a key.
     * - key: sessionId or dedupeKey (string)
     * - fn: async function that performs the commit
     * - delay: ms to wait since last schedule call before running fn
     */
    schedule(key: string, fn: () => Promise<void>, delay = 5000) {
      // if there's an existing timer, clear it (this resets debounce)
      const existing = map.get(key);
      if (existing) {
        clearTimeout(existing.timeout);
      }

      // store function and new timeout
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const timeout = setTimeout(async () => {
        try {
          // run latest fn
          await fn();
        } catch {
          // swallow or you can rethrow/log depending on need
        } finally {
          map.delete(key);
        }
      }, delay);

      map.set(key, { timeout, fn });
    },

    cancel(key: string) {
      const e = map.get(key);
      if (e) {
        clearTimeout(e.timeout);
        map.delete(key);
      }
    },

    // flush immediately (run now, cancel timer)
    async flushNow(key: string) {
      const e = map.get(key);
      if (!e) return;
      clearTimeout(e.timeout);
      map.delete(key);
      try {
        await e.fn();
      } catch (err) {
        console.error('commit-scheduler - flush error', err);
      }
    },
  };
}
