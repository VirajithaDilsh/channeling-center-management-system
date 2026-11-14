import { useCallback, useEffect, useRef, useState } from "react";
import { wakeForecastService } from "../../../api/reportsApi";

const POLL_MS = 5000;
const TIMEOUT_MS = 90000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wakes the (Render-hosted) forecasting service: asks the backend to probe its
// /health every 5s until it answers, giving up after 90s. Calls onReady() once
// it is healthy. status: "idle" | "waking" | "error".
export default function useForecastWake(onReady) {
  const [state, setState] = useState({ status: "idle", elapsed: 0, message: "" });
  const running = useRef(false);
  const mounted = useRef(true);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const wake = useCallback(async () => {
    if (running.current) return; // a wake-up is already in progress
    running.current = true;
    const startedAt = Date.now();
    const set = (next) => mounted.current && setState(next);
    const tick = setInterval(
      () => mounted.current && setState((s) => (s.status === "waking" ? { ...s, elapsed: Math.floor((Date.now() - startedAt) / 1000) } : s)),
      1000
    );
    set({ status: "waking", elapsed: 0, message: "" });

    try {
      while (mounted.current) {
        const { status } = await wakeForecastService();
        if (status === "ready") {
          set({ status: "idle", elapsed: 0, message: "" });
          if (mounted.current) onReadyRef.current?.();
          return;
        }
        if (Date.now() - startedAt + POLL_MS >= TIMEOUT_MS) {
          set({ status: "error", elapsed: 0, message: "The forecasting service didn't respond within 90 seconds." });
          return;
        }
        await sleep(POLL_MS);
      }
    } catch (err) {
      set({
        status: "error",
        elapsed: 0,
        message: err.response?.data?.message || "Couldn't reach the forecasting service. Please try again.",
      });
    } finally {
      clearInterval(tick);
      running.current = false;
    }
  }, []);

  return { ...state, waking: state.status === "waking", wake };
}
