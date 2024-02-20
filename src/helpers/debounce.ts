import { useCallback, useRef } from "react";

type AsyncFunction<T extends any[] = any[], R = any> = (
  ...args: T
) => Promise<R>;

export function useDebouncedCallbackAsync<T extends any[] = any[], R = any>(
  callback: AsyncFunction<T, R>,
  delay: number,
  afterFunction?: () => void,
) {
  const lastTimeout = useRef<number | null>(null);

  const debouncedFunction = useCallback(
    (...args: T) => {
      if (lastTimeout.current !== null) {
        clearTimeout(lastTimeout.current);
      }
      lastTimeout.current = window.setTimeout(async () => {
        await callback(...args);
        afterFunction?.();
      }, delay);
    },
    [callback, delay, afterFunction],
  );

  const clearDebounce = useCallback(() => {
    if (lastTimeout.current !== null) {
      clearTimeout(lastTimeout.current);
    }
  }, []);

  return { debouncedFunction, clearDebounce };
}
