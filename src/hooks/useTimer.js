import { useState, useEffect, useRef } from "react";

export function useTimer({ focusDur, breakDur, soundEnabled, onSessionComplete, onQuoteChange }) {
  const [mode, setMode]         = useState("focus");
  const [timeLeft, setTimeLeft] = useState(focusDur * 60);
  const [isRunning, setIsRunning] = useState(false);

  const modeRef  = useRef(mode);
  const focRef   = useRef(focusDur);
  const brkRef   = useRef(breakDur);
  modeRef.current = mode;
  focRef.current  = focusDur;
  brkRef.current  = breakDur;

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {}
  };

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        playChime();
        onQuoteChange();
        if (modeRef.current === "focus") {
          onSessionComplete(focRef.current);
          setMode("break");
          return brkRef.current * 60;
        } else {
          setMode("focus");
          return focRef.current * 60;
        }
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); setIsRunning(r => !r); }
      if (e.key.toLowerCase() === "r") handleReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusDur]);

  const togglePlay = () => setIsRunning(r => !r);

  const handleReset = () => {
    setIsRunning(false);
    setMode("focus");
    setTimeLeft(focusDur * 60);
  };

  const switchMode = (m, { focusDur: fd, breakDur: bd }) => {
    if (isRunning) return;
    setMode(m);
    setTimeLeft((m === "focus" ? fd : bd) * 60);
    onQuoteChange();
  };

  return { mode, timeLeft, isRunning, togglePlay, handleReset, switchMode };
}