import { z, ZodTypeAny } from 'zod';

/**
 * Xử lý giá trị array từ query/body:
 * - "[A,B]" → ["A", "B"]
 * - "A"     → ["A"]
 * - ["A"]   → ["A"]
 */
export function zPreprocessArray<T extends ZodTypeAny>(inner: T) {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.trim();
      if (s.startsWith('[') && s.endsWith(']')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            // ✅ Check element types here
            const safeArray = parsed.filter(
              (item) =>
                typeof item === 'string' ||
                typeof item === 'number' ||
                typeof item === 'boolean',
            );
            return safeArray;
          }
        } catch {
          // ignore parse error
        }
      }
      return [val];
    }
    return val;
  }, z.array(inner));
}

/**
 * Xử lý boolean từ string:
 * - "true" → true
 * - "false" → false
 * - true/false → giữ nguyên
 */
export const zPreprocessBoolean = z.preprocess((val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (typeof val === 'boolean') return val;
  return undefined; // hoặc throw error rõ ràng
}, z.boolean());
