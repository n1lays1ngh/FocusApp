import { useState, useEffect, useRef } from "react";

/* ── Web Audio tone presets ─────────────────────────────── */
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const configs = {
      bell: [
        { freq: 987.77, type: "sine",     attack: 0.01, decay: 2.2, gain: 0.18 },
        { freq: 1318.5, type: "sine",     attack: 0.01, decay: 1.4, gain: 0.10 },
      ],
      chime: [
        { freq: 1046.5, type: "triangle", attack: 0.01, decay: 1.6, gain: 0.15 },
        { freq: 1567.98,type: "triangle", attack: 0.08, decay: 1.1, gain: 0.10 },
        { freq: 2093.0, type: "triangle", attack: 0.16, decay: 0.8, gain: 0.07 },
      ],
      soft: [
        { freq: 528,    type: "sine",     attack: 0.08, decay: 1.8, gain: 0.10 },
        { freq: 660,    type: "sine",     attack: 0.12, decay: 1.2, gain: 0.06 },
      ],
      none: [],
    };

    const tones = configs[type] || configs.bell;
    tones.forEach(({ freq, type: wt, attack, decay, gain: g }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = wt;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(g,     ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + decay);
    });
  } catch (e) {}
}

/* ── hook ───────────────────────────────────────────────── */
export function useTimer({
  focusDur,
  breakDur,
  longBreakDur,
  sessionsUntilLongBreak,
  soundEnabled,
  notificationSound,
  autoStart,
  onSessionComplete,
}) {
  const [mode,      setMode]      = useState("focus");
  const [timeLeft,  setTimeLeft]  = useState(focusDur * 60);
  const [isRunning, setIsRunning] = useState(false);

  const modeRef       = useRef(mode);
  const focRef        = useRef(focusDur);
  const brkRef        = useRef(breakDur);
  const longBrkRef    = useRef(longBreakDur);
  const sessionsRef   = useRef(sessionsUntilLongBreak);
  const soundRef      = useRef(notificationSound);
  const soundEnabled$ = useRef(soundEnabled);
  const autoStartRef  = useRef(autoStart);
  const completedRef  = useRef(0);

  modeRef.current       = mode;
  focRef.current        = focusDur;
  brkRef.current        = breakDur;
  longBrkRef.current    = longBreakDur;
  sessionsRef.current   = sessionsUntilLongBreak;
  soundRef.current      = notificationSound;
  soundEnabled$.current = soundEnabled;
  autoStartRef.current  = autoStart;

  const previewSound = (type) => {
    if (soundEnabled$.current) playSound(type);
  };

  const chime = () => {
    if (soundEnabled$.current) playSound(soundRef.current);
  };

  /* ── countdown interval ── */
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;

        chime();

        const currentMode = modeRef.current;

        if (currentMode === "focus") {
          onSessionComplete(focRef.current);
          completedRef.current += 1;

          const goLong   = completedRef.current % sessionsRef.current === 0;
          const nextMode = goLong ? "longbreak" : "break";
          const nextSecs = goLong ? longBrkRef.current * 60 : brkRef.current * 60;

          setMode(nextMode);
          if (!autoStartRef.current) setIsRunning(false);
          return nextSecs;

        } else {
          setMode("focus");
          if (!autoStartRef.current) setIsRunning(false);
          return focRef.current * 60;
        }
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  /* ── keyboard shortcuts ── */
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
    completedRef.current = 0;
  };

  const switchMode = (m, { focusDur: fd, breakDur: bd, longBreakDur: ld }) => {
    if (isRunning) return;
    setMode(m);
    if (m === "focus")     setTimeLeft(fd * 60);
    if (m === "break")     setTimeLeft(bd * 60);
    if (m === "longbreak") setTimeLeft(ld * 60);
  };

  return { mode, timeLeft, isRunning, togglePlay, handleReset, switchMode, previewSound };
}