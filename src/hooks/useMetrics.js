
import { useState } from "react";
import { load, save, today, streak } from "../utils/persistence";
 
export function useMetrics() {
  const [metrics, setMetrics] = useState(load);
 
  const recordSession = (focusDur) => {
    try {
      const logKey = "pomoflow_session_log";
      const existing = JSON.parse(localStorage.getItem(logKey) || "[]");
      existing.push({
        date: new Date().toISOString().split("T")[0],
        minutes: focusDur,
      });
      localStorage.setItem(logKey, JSON.stringify(existing));
    } catch {}
 
    setMetrics(m => {
      const u = {
        ...m,
        totalFocusMinutes: m.totalFocusMinutes + focusDur,
        sessionsCompleted: m.sessionsCompleted + 1,
        lastActiveDate: today(),
        currentStreak: streak(m),
      };
      save(u);
      return u;
    });
  };
 
  return { metrics, recordSession };
}
 