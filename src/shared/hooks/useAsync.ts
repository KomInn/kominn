import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  /** Sann mens reload() henter nye data i bakgrunnen. */
  refreshing: boolean;
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
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  const latest = useRef(0);
  const silent = useRef(false);

  useEffect(() => {
    const id = ++latest.current;
    // reload() oppdaterer i bakgrunnen: eksisterende data vises til nye data er hentet, uten spinner.
    if (silent.current) setRefreshing(true);
    else setLoading(true);
    silent.current = false;
    setError(undefined);
    fn().then(
      (result) => {
        if (id !== latest.current) return;
        setData(result);
        setLoading(false);
        setRefreshing(false);
      },
      (err: unknown) => {
        if (id !== latest.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
        setRefreshing(false);
      }
    );
  }, [...deps, tick]);

  const reload = useCallback(() => {
    silent.current = true;
    setTick((t) => t + 1);
  }, []);
  return { data, error, loading, refreshing, reload };
}
