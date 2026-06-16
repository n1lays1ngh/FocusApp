import { useState, useEffect } from "react";
import {
  Play, Pause, RotateCcw, Settings, BarChart2,
  Coffee, Brain,
  ChevronUp, ChevronDown, Sun, Moon, Target, Volume2, VolumeX
} from "lucide-react";


import { ParticleBg }       from "./components/ParticleBg";
import { TypewriterQuote }  from "./components/TypewriterQuote";
import { StatsModal }       from "./components/StatsModal";
import { useClock }         from "./hooks/useClock";
import { useMetrics }       from "./hooks/useMetrics";
import { useTimer }         from "./hooks/useTimer";
import { QUOTES }           from "./constants/quotes";
import { SettingsModal }    from "./components/SettingsModal";

/* ─── ring constants ───────────────────────────────────── */
const R = 116, CIRC = 2 * Math.PI * R;

export default function App() {
  const [dark, setDark]               = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusDur, setFocusDur]       = useState(25);
  const [breakDur, setBreakDur]       = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats]       = useState(false);
  const [longBreakDur, setLongBreakDur] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [autoStart, setAutoStart]       = useState(false);
  const [notificationSound, setNotificationSound] = useState("bell");
  const [timerFormat, setTimerFormat]   = useState("mmss");
  const [quote, setQuote]             = useState(QUOTES[0]);
  const [currentTask, setCurrentTask] = useState("");

  const clockTime           = useClock();
  const { metrics, recordSession } = useMetrics();

  const changeQuote = () => {
    setQuote(q => {
      let next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      if (QUOTES.length > 1 && next === q) {
        next = QUOTES[(QUOTES.indexOf(q) + 1) % QUOTES.length];
      }
      return next;
    });
  };

  const { mode, timeLeft, isRunning, togglePlay, handleReset, switchMode } = useTimer({
    focusDur,
    breakDur,
    soundEnabled,
    onSessionComplete: recordSession,
    onQuoteChange: changeQuote,
  });

  const isFocus   = mode === "focus";
  const totalSecs = isFocus ? focusDur * 60 : breakDur * 60;
  const progress  = 1 - timeLeft / totalSecs;
  const dash      = progress * CIRC;
  const mm        = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss        = String(timeLeft % 60).padStart(2, "0");

  const T = dark ? {
    bg:       "linear-gradient(145deg,#150c06 0%,#1e1208 50%,#180e06 100%)",
    card:     "rgba(32,18,8,0.72)",
    cardBdr:  "rgba(201,74,43,0.18)",
    pill:     "rgba(255,255,255,0.05)",
    text:     "#f5ede0",
    muted:    "rgba(245,237,224,0.4)",
    subtle:   "rgba(245,237,224,0.15)",
    ctrl:     "rgba(255,255,255,0.07)",
    ctrlBdr:  "rgba(255,255,255,0.1)",
    ring0:    "rgba(255,255,255,0.06)",
    statCard: "rgba(255,255,255,0.04)",
    modal:    "rgba(18,10,4,0.97)",
    inputRow: "rgba(255,255,255,0.03)",
    divider:  "rgba(255,255,255,0.08)",
  } : {
    bg:       "linear-gradient(145deg,#f5ede0 0%,#ecdbc4 50%,#f0e4cf 100%)",
    card:     "rgba(255,248,238,0.82)",
    cardBdr:  "rgba(201,74,43,0.2)",
    pill:     "rgba(0,0,0,0.05)",
    text:     "#1a0e06",
    muted:    "rgba(26,14,6,0.45)",
    subtle:   "rgba(26,14,6,0.12)",
    ctrl:     "rgba(0,0,0,0.06)",
    ctrlBdr:  "rgba(0,0,0,0.1)",
    ring0:    "rgba(0,0,0,0.08)",
    statCard: "rgba(0,0,0,0.04)",
    modal:    "rgba(250,242,228,0.98)",
    inputRow: "rgba(0,0,0,0.03)",
    divider:  "rgba(0,0,0,0.08)",
  };

  const accent   = isFocus ? "#c94a2b" : "#c4922a";
  const accent2  = isFocus ? "#8c2c14" : "#7a5a10";
  const glow     = isFocus ? "rgba(201,74,43,0.32)" : "rgba(196,146,42,0.28)";
  const accentMd = isFocus ? "rgba(201,74,43,0.18)" : "rgba(196,146,42,0.16)";

  useEffect(() => {
    document.title = `${mm}:${ss} | ${isFocus ? "Focus" : "Break"} — PomoFlow`;
  }, [timeLeft, mode]);

  const setFoc = v => { const n = Math.max(1, Math.min(99, v)); setFocusDur(n); if (!isRunning && mode === "focus") handleReset(); };
  const setBrk = v => { const n = Math.max(1, Math.min(30, v)); setBreakDur(n); };

  const b = { border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.22s", fontFamily: "inherit" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5ede0; }
        .ctrl:hover  { filter: brightness(${dark ? "1.25" : "0.88"}); }
        .ctrl:active { transform: scale(.93); }
        .play:hover  { filter: brightness(1.12); }
        .play:active { transform: scale(.95); }
        .mdbtn:hover { background: rgba(201,74,43,0.08) !important; }
        .sbtn:hover  { opacity: .85; }
        .step:hover  { filter: brightness(${dark ? "1.3" : "0.82"}); }
        .step:active { transform: scale(.9); }
        .tog:hover   { filter: brightness(${dark ? "1.2" : "0.9"}); }
        .ghost-input::placeholder { color: ${T.muted}; opacity: 0.6; }
        @keyframes fi { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fi { animation: fi .22s ease; }
        @keyframes mi { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .mi { animation: mi .2s ease; }
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes floatUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .floatUp { animation: floatUp .5s cubic-bezier(.2,.8,.2,1); }
        @media (max-width: 880px) {
          .pf-grid { grid-template-columns: 1fr !important; }
          .pf-left { padding-right: 0 !important; border-right: none !important; align-items: center !important; text-align: center !important; }
          .pf-divider { display: none !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh", width: "100%", background: T.bg, position: "relative",
        overflow: "hidden", fontFamily: "'Syne', sans-serif",
      }}>
        <ParticleBg dark={dark} />

        {/* ── top-left clock ── */}
        <div style={{ position: "absolute", top: 28, left: 32, zIndex: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 50, color: T.text, letterSpacing: ".02em", lineHeight: 1,
          }}>
            {clockTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span style={{
            fontSize: 10, color: T.text, fontWeight: 800, letterSpacing: ".18em",
          }}>
            {clockTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
          </span>
        </div>

        {/* ── top-right controls ── */}
        <div style={{ position: "absolute", top: 28, right: 32, zIndex: 10, display: "flex", gap: 12 }}>
          <button className="tog" onClick={() => setSoundEnabled(s => !s)} style={{
            ...b, width: 42, height: 42, borderRadius: "50%",
            background: T.ctrl, border: `1px solid ${T.ctrlBdr}`, color: T.text,
          }}>
            {soundEnabled ? <Volume2 size={17} strokeWidth={2.1}/> : <VolumeX size={17} strokeWidth={2.1} opacity={0.5}/>}
          </button>
          <button className="tog" onClick={() => setDark(d => !d)} style={{
            ...b, width: 42, height: 42, borderRadius: "50%",
            background: T.ctrl, border: `1px solid ${T.ctrlBdr}`, color: T.text,
          }}>
            {dark ? <Sun size={17} strokeWidth={2.1}/> : <Moon size={17} strokeWidth={2.1}/>}
          </button>
        </div>

        {/* ── full-bleed landscape split ── */}
        <div className="pf-grid floatUp" style={{
          position: "relative", zIndex: 1,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          minHeight: "100vh", width: "100%",
        }}>

          {/* LEFT: brand + quote + task */}
          <div className="pf-left" style={{
            display: "flex", flexDirection: "column", gap: 30,
            justifyContent: "center",
            padding: "60px 6vw 60px 7vw",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: "'DM Serif Display', serif", fontSize: "clamp(40px, 5.5vw, 64px)", fontStyle: "italic",
                  color: T.text, letterSpacing: "-1.5px", lineHeight: 1,
                }}>Pomo</span>
                <span style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(40px, 5.5vw, 64px)",
                  color: accent, letterSpacing: "-2px", lineHeight: 1,
                }}>Flow</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                <span style={{ width: 26, height: 1.5, background: accent, opacity: 0.6 }} />
                <span style={{ color: T.muted, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.24em" }}>
                  DEEP WORK, ON A TIMER
                </span>
              </div>
            </div>

            <div style={{ maxWidth: 440 }}>
              <TypewriterQuote quote={quote} T={T} accent={accent} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 9, maxWidth: 360 }}>
              <Target size={14} color={T.muted} style={{ flexShrink: 0 }} />
              <input
                className="ghost-input"
                type="text"
                placeholder="What are we focusing on?"
                value={currentTask}
                onChange={e => setCurrentTask(e.target.value)}
                style={{
                  background: "transparent", border: "none", borderBottom: `1px dashed ${T.subtle}`,
                  color: T.text, fontSize: 14, padding: "4px 0px", outline: "none",
                  width: "100%", fontFamily: "inherit", fontWeight: 600,
                }}
              />
            </div>

            <button className="sbtn" onClick={() => setShowStats(true)} style={{
              ...b, gap: 7, alignSelf: "flex-start",
              background: T.ctrl, border: `1px solid ${T.ctrlBdr}`, borderRadius: 100,
              padding: "10px 22px", color: T.muted, fontSize: 12, fontWeight: 700,
              letterSpacing: ".05em",
            }}>
              <BarChart2 size={14} strokeWidth={2.2}/> Lifetime Stats
            </button>
          </div>

          {/* RIGHT: timer + controls */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26,
            padding: "60px 6vw",
            position: "relative",
          }}>
            <div className="pf-vrule" style={{
              position: "absolute", left: 0, top: "12%", bottom: "12%", width: 1,
              background: T.divider,
            }} />

            <div style={{ display: "flex", background: T.pill, borderRadius: 100, padding: 5, gap: 3 }}>
              {[{ id: "focus", icon: <Brain size={14}/>, label: "Focus" },
                { id: "break", icon: <Coffee size={14}/>, label: "Break" }].map(({ id, icon, label }) => {
                const active = mode === id;
                const ac = id === "focus" ? "#c94a2b" : "#c4922a";
                return (
                  <button key={id} className="mdbtn" onClick={() => switchMode(id, { focusDur, breakDur })} style={{
                    ...b, padding: "8px 22px", borderRadius: 100,
                    background: active ? (id === "focus" ? "rgba(201,74,43,0.14)" : "rgba(196,146,42,0.14)") : "transparent",
                    color: active ? ac : T.muted,
                    fontSize: 13, fontWeight: 700, gap: 6, letterSpacing: ".05em",
                    cursor: isRunning ? "not-allowed" : "pointer",
                  }}>
                    {icon}{label}
                  </button>
                );
              })}
            </div>

            <div style={{ position: "relative", width: "min(420px, 38vw, 78vh)", height: "min(420px, 38vw, 78vh)", aspectRatio: "1/1" }}>
              <svg viewBox="0 0 272 272" style={{ transform: "rotate(-90deg)", display: "block", width: "100%", height: "100%" }}>
                <circle cx={136} cy={136} r={R} fill="none" stroke={T.ring0} strokeWidth={9}/>
                {[...Array(60)].map((_, i) => {
                  const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
                  const inner = i % 5 === 0 ? R - 14 : R - 8;
                  return <line key={i}
                    x1={136 + R * Math.cos(a + Math.PI / 2)} y1={136 + R * Math.sin(a + Math.PI / 2)}
                    x2={136 + inner * Math.cos(a + Math.PI / 2)} y2={136 + inner * Math.sin(a + Math.PI / 2)}
                    stroke={T.ring0} strokeWidth={i % 5 === 0 ? 2 : 1} strokeLinecap="round"
                  />;
                })}
                <circle cx={136} cy={136} r={R} fill="none" stroke={accent} strokeWidth={9}
                  strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 14px ${glow})`, transition: "stroke-dasharray 0.85s cubic-bezier(.4,0,.2,1), stroke 0.5s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: "clamp(64px, 9vw, 104px)", fontWeight: 400, color: T.text, fontFamily: "'DM Serif Display',serif", letterSpacing: "-2px", lineHeight: 1 }}>
                  {mm}:{ss}
                </span>
                <span style={{ fontSize: 12, color: T.muted, letterSpacing: ".24em", fontWeight: 600 }}>
                  {isFocus ? "DEEP FOCUS" : "REST TIME"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <button className="ctrl" onClick={handleReset} style={{
                ...b, width: 48, height: 48, borderRadius: "50%",
                background: T.ctrl, border: `1px solid ${T.ctrlBdr}`, color: T.muted,
              }}>
                <RotateCcw size={18} strokeWidth={2.2}/>
              </button>
              <button className="play" onClick={togglePlay} style={{
                ...b, width: 76, height: 76, borderRadius: "50%",
                background: `linear-gradient(140deg,${accent},${accent2})`,
                color: "#fff",
                boxShadow: `0 8px 28px ${glow}, 0 0 0 1px rgba(255,255,255,0.1)`,
              }}>
                {isRunning
                  ? <Pause size={27} strokeWidth={2.2}/>
                  : <Play  size={27} strokeWidth={2.2} style={{ marginLeft: 3 }}/>}
              </button>
              <button className="ctrl" onClick={() => setShowSettings(s => !s)} style={{
                ...b, width: 48, height: 48, borderRadius: "50%",
                background: showSettings ? accentMd : T.ctrl,
                border: `1px solid ${showSettings ? accent + "55" : T.ctrlBdr}`,
                color: showSettings ? accent : T.muted,
              }}>
                <Settings size={18} strokeWidth={2.2}/>
              </button>
            </div>

            <span style={{ fontSize: 10.5, color: T.subtle, letterSpacing: ".1em", fontWeight: 600 }}>
              SPACE TO PLAY · R TO RESET
            </span>

            {/* {showSettings && (
              <div className="fi" style={{
                width: "min(360px, 90%)", background: T.inputRow,
                border: `1px solid ${T.subtle}`, borderRadius: 20, padding: "18px 22px",
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <p style={{ fontSize: 10, color: T.muted, letterSpacing: ".2em", fontWeight: 700 }}>TIMER SETTINGS</p>
                {[
                  { label: "Focus Session", icon: <Brain size={13}/>, val: focusDur, set: setFoc, col: "#c94a2b" },
                  { label: "Short Break",   icon: <Coffee size={13}/>, val: breakDur, set: setBrk, col: "#c4922a" },
                ].map(({ label, icon, val, set, col }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: T.muted }}>
                      <span style={{ color: col }}>{icon}</span>
                      {label} <span style={{ color: T.subtle, fontSize: 11 }}>min</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button className="step" onClick={() => set(val - 1)} style={{ ...b, width: 26, height: 26, borderRadius: "50%", background: T.ctrl, color: T.text, border: `1px solid ${T.ctrlBdr}` }}>
                        <ChevronDown size={13} strokeWidth={2.5}/>
                      </button>
                      <span style={{ color: T.text, fontWeight: 800, fontSize: 16, minWidth: 28, textAlign: "center" }}>{val}</span>
                      <button className="step" onClick={() => set(val + 1)} style={{ ...b, width: 26, height: 26, borderRadius: "50%", background: T.ctrl, color: T.text, border: `1px solid ${T.ctrlBdr}` }}>
                        <ChevronUp size={13} strokeWidth={2.5}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        </div>
      </div>
      {showSettings && (
        <SettingsModal
          T={T}
          accent={accent}
          accent2={accent2}
          dark={dark}
          onClose={() => setShowSettings(false)}
          focusDur={focusDur}
          breakDur={breakDur}
          setFoc={setFoc}
          setBrk={setBrk}
          longBreakDur={longBreakDur}
          setLongBreakDur={setLongBreakDur}
          sessionsUntilLongBreak={sessionsUntilLongBreak}
          setSessionsUntilLongBreak={setSessionsUntilLongBreak}
          autoStart={autoStart}
          setAutoStart={setAutoStart}
          notificationSound={notificationSound}
          setNotificationSound={setNotificationSound}
          timerFormat={timerFormat}
          setTimerFormat={setTimerFormat}
        />
      )}

      {showStats && (
        <StatsModal
          metrics={metrics}
          T={T}
          accent={accent}
          accent2={accent2}
          dark={dark}
          onClose={() => setShowStats(false)}
        />
      )}
    </>
  );
}