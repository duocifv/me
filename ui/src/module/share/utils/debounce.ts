export function debounce(
  func: (value: any) => void,
  wait: number,
  immediate: boolean = false
): ((value: string | object | number) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (value: string | object | number) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    const later = () => {
      timeout = null;
      if (!immediate) {
        func(value);
      }
    };
    const callNow = immediate && timeout === null;
    timeout = setTimeout(later, wait);
    if (callNow) {
      func(value);
    }
  };

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = null;
  };

  return debounced;
}
