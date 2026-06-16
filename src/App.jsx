import { useState, useEffect } from "react";
import {
  BarChart2, Brain, Coffee,
  Sun, Moon, Target, Volume2, VolumeX
} from "lucide-react";

import { ParticleBg }      from "./components/ParticleBg";
import { TypewriterQuote } from "./components/TypewriterQuote";
import { StatsModal }      from "./components/StatsModal";
import { SettingsModal }   from "./components/SettingsModal";
import { TimerDisplay }    from "./components/TimerDisplay";
import { useClock }        from "./hooks/useClock";
import { useMetrics }      from "./hooks/useMetrics";
import { useTimer }        from "./hooks/useTimer";
// import { QUOTES }          from "./constants/quotes";

export default function App() {
  const [dark, setDark]                 = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusDur, setFocusDur]         = useState(25);
  const [breakDur, setBreakDur]         = useState(5);
  const [longBreakDur, setLongBreakDur] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [autoStart, setAutoStart]       = useState(false);
  const [notificationSound, setNotificationSound] = useState("bell");
  const [timerFormat, setTimerFormat]   = useState("mmss");
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats]       = useState(false);
  // const [quote, setQuote]               = useState(QUOTES[0]);
  const [currentTask, setCurrentTask]   = useState("");

  const clockTime                  = useClock();
  const { metrics, recordSession } = useMetrics();

  // const changeQuote = () => {
  //   setQuote(q => {
  //     let next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  //     if (QUOTES.length > 1 && next === q)
  //       next = QUOTES[(QUOTES.indexOf(q) + 1) % QUOTES.length];
  //     return next;
  //   });
  // };

  const {
    mode, timeLeft, isRunning,
    togglePlay, handleReset, switchMode,
    previewSound,
  } = useTimer({
    focusDur,
    breakDur,
    longBreakDur,
    sessionsUntilLongBreak,
    soundEnabled,
    notificationSound,
    autoStart,
    onSessionComplete: recordSession,
    // onQuoteChange: changeQuote,
  });

  const isFocus = mode === "focus";

  /* accent follows focus/break/longbreak */
  const accent   = isFocus ? "#c94a2b" : mode === "longbreak" ? "#4a7fa5" : "#c4922a";
  const accent2  = isFocus ? "#8c2c14" : mode === "longbreak" ? "#2d5470" : "#7a5a10";
  const glow     = isFocus ? "rgba(201,74,43,0.32)" : mode === "longbreak" ? "rgba(74,127,165,0.28)" : "rgba(196,146,42,0.28)";
  const accentMd = isFocus ? "rgba(201,74,43,0.18)" : mode === "longbreak" ? "rgba(74,127,165,0.16)" : "rgba(196,146,42,0.16)";

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

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

  useEffect(() => {
    document.title = `${mm}:${ss} | ${isFocus ? "Focus" : mode === "longbreak" ? "Long Break" : "Break"} — PomoFlow`;
  }, [timeLeft, mode]);

  const setFoc = v => {
    const n = Math.max(1, Math.min(99, v));
    setFocusDur(n);
    if (!isRunning && mode === "focus") handleReset();
  };
  const setBrk = v => { setBreakDur(Math.max(1, Math.min(30, v))); };

  const b = {
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.22s", fontFamily: "inherit",
  };

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
        .tog:hover   { filter: brightness(${dark ? "1.2" : "0.9"}); }
        .ghost-input::placeholder { color: ${T.muted}; opacity: 0.6; }
        @keyframes floatUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .floatUp { animation: floatUp .5s cubic-bezier(.2,.8,.2,1); }
        @media (max-width: 880px) {
          .pf-grid { grid-template-columns: 1fr !important; }
          .pf-left { padding-right: 0 !important; border-right: none !important; align-items: center !important; text-align: center !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh", width: "100%", background: T.bg, position: "relative",
        overflow: "hidden", fontFamily: "'Syne', sans-serif",
      }}>
        <ParticleBg dark={dark} />

        {/* ── top-left clock ── */}
        <div style={{ position: "absolute", top: 28, left: 32, zIndex: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 50, color: T.text, letterSpacing: ".02em", lineHeight: 1 }}>
            {clockTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span style={{ fontSize: 10, color: T.text, fontWeight: 800, letterSpacing: ".18em" }}>
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

        {/* ── split layout ── */}
        <div className="pf-grid floatUp" style={{
          position: "relative", zIndex: 1,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          minHeight: "100vh", width: "100%",
        }}>

          {/* LEFT */}
          <div className="pf-left" style={{
            display: "flex", flexDirection: "column", gap: 30,
            justifyContent: "center", padding: "60px 6vw 60px 7vw",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: "'DM Serif Display', serif", fontSize: "clamp(40px, 5.5vw, 64px)",
                  fontStyle: "italic", color: T.text, letterSpacing: "-1.5px", lineHeight: 1,
                }}>Pomo</span>
                <span style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "clamp(40px, 5.5vw, 64px)", color: accent,
                  letterSpacing: "-2px", lineHeight: 1,
                }}>Flow</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                <span style={{ width: 26, height: 1.5, background: accent, opacity: 0.6 }}/>
                <span style={{ color: T.muted, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.24em" }}>
                  DEEP WORK, ON A TIMER
                </span>
              </div>
            </div>

            <div style={{ maxWidth: 440 }}>
              <TypewriterQuote T={T} accent={accent} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 9, maxWidth: 520 }}>
              <Target size={14} color={T.muted} style={{ flexShrink: 0 }}/>
              <input
                className="ghost-input"
                type="text"
                placeholder="What are we focusing on?"
                value={currentTask}
                onChange={e => setCurrentTask(e.target.value)}
                style={{
                  background: "transparent", border: "none",
                  borderBottom: `1px dashed ${T.subtle}`,
                  color: T.text, fontSize: 25, padding: "6px 0", outline: "none",
                  width: "100%", fontFamily: "DM Serif Display",fontStyle : "italic", fontWeight: 600,
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

          {/* RIGHT */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 26,
            padding: "60px 6vw", position: "relative",
          }}>
            <div style={{
              position: "absolute", left: 0, top: "12%", bottom: "12%", width: 1,
              background: T.divider,
            }}/>

            <TimerDisplay
              mode={mode}
              timeLeft={timeLeft}
              isRunning={isRunning}
              focusDur={focusDur}
              breakDur={breakDur}
              longBreakDur={longBreakDur}
              togglePlay={togglePlay}
              handleReset={handleReset}
              switchMode={switchMode}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              timerFormat={timerFormat}
              T={T}
              accent={accent}
              accent2={accent2}
              glow={glow}
              accentMd={accentMd}
            />
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          T={T} accent={accent} accent2={accent2} dark={dark}
          onClose={() => setShowSettings(false)}
          focusDur={focusDur} breakDur={breakDur}
          setFoc={setFoc} setBrk={setBrk}
          longBreakDur={longBreakDur} setLongBreakDur={setLongBreakDur}
          sessionsUntilLongBreak={sessionsUntilLongBreak}
          setSessionsUntilLongBreak={setSessionsUntilLongBreak}
          autoStart={autoStart} setAutoStart={setAutoStart}
          notificationSound={notificationSound} setNotificationSound={setNotificationSound}
          timerFormat={timerFormat} setTimerFormat={setTimerFormat}
          onPreviewSound={previewSound}
        />
      )}

      {showStats && (
        <StatsModal
          metrics={metrics}
          T={T} accent={accent} accent2={accent2} dark={dark}
          onClose={() => setShowStats(false)}
        />
      )}
    </>
  );
}