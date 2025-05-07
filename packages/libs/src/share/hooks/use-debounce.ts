import { useRef, useCallback, useEffect } from "react";

/**
 * Hook `useDebounceFn` tạo ra một hàm debounce từ một hàm callback.
 *
 * @template T - Kiểu của hàm callback.
 * @param fn - Hàm callback cần debounce.
 * @param delay - Thời gian trễ (tính bằng mili giây). Mặc định là 500ms.
 * @returns Một hàm debounce.
 */
export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 286
): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return debounced;
}
