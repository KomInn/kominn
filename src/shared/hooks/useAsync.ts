import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  /** Kjør på nytt, f.eks. etter en endring. */
  reload: () => void;
}

/**
 * Kjører en asynkron funksjon når avhengighetene endrer seg og ignorerer svar fra utdaterte kall.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    const id = ++latest.current;
    setLoading(true);
    setError(undefined);
    fn().then(
      (result) => {
        if (id !== latest.current) return;
        setData(result);
        setLoading(false);
      },
      (err: unknown) => {
        if (id !== latest.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    );
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
