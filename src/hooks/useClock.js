import { useState, useEffect } from "react";

export function useClock() {
  const [clockTime, setClockTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return clockTime;
}