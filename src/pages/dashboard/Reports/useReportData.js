import { useCallback, useEffect, useState } from "react";

// { status: loading|success|error, data, error } for one report call. Each card
// owns its own state, so the forecast service being down never blanks the rest.
// A result only counts while it belongs to the current fetcher + reload tick, so
// changing a filter shows "loading" without setting state inside the effect.
export default function useReportData(fetcher, label) {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState({ key: null, status: "loading", data: null, error: null });
  const key = `${tick}:${label}`;

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => !cancelled && setResult({ key, fetcher, status: "success", data, error: null }))
      .catch((err) =>
        !cancelled &&
        setResult({
          key,
          fetcher,
          status: "error",
          data: null,
          error: { label, status: err.response?.status, message: err.response?.data?.message },
        })
      );
    return () => { cancelled = true; };
  }, [fetcher, label, key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const current = result.fetcher === fetcher && result.key === key;
  return current
    ? { status: result.status, data: result.data, error: result.error, reload }
    : { status: "loading", data: null, error: null, reload };
}
