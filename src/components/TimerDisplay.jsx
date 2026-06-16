import { Brain, Coffee, Moon, Play, Pause, RotateCcw, Settings } from "lucide-react";

const R    = 116;
const CIRC = 2 * Math.PI * R;

export function TimerDisplay({
  mode, timeLeft, isRunning,
  focusDur, breakDur, longBreakDur,
  togglePlay, handleReset, switchMode,
  showSettings, setShowSettings,
  timerFormat,
  T, accent, accent2, glow, accentMd,
}) {
  const isFocus     = mode === "focus";
  const isLongBreak = mode === "longbreak";
  const isBreak     = mode === "break";

  const totalSecs = isFocus ? focusDur * 60 : isBreak ? breakDur * 60 : longBreakDur * 60;
  const progress  = 1 - timeLeft / totalSecs;
  const dash      = progress * CIRC;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const pct = Math.round(progress * 100);

  const modeLabel = isFocus ? "DEEP FOCUS" : isBreak ? "SHORT BREAK" : "LONG BREAK";

  const b = {
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.22s", fontFamily: "inherit",
  };

  const MODES = [
    { id: "focus",     icon: <Brain  size={14}/>, label: "Focus"      },
    { id: "break",     icon: <Coffee size={14}/>, label: "Short Break" },
    { id: "longbreak", icon: <Moon   size={14}/>, label: "Long Break"  },
  ];

  const modeAccent = (id) => {
    if (id === "focus")     return "#c94a2b";
    if (id === "break")     return "#c4922a";
    if (id === "longbreak") return "#4a7fa5";
    return accent;
  };

  const modeBg = (id) => {
    if (id === "focus")     return "rgba(201,74,43,0.14)";
    if (id === "break")     return "rgba(196,146,42,0.14)";
    if (id === "longbreak") return "rgba(74,127,165,0.14)";
    return "transparent";
  };

  return (
    <>
      {/* ── mode pill ── */}
      <div style={{ display: "flex", background: T.pill, borderRadius: 100, padding: 5, gap: 3 }}>
        {MODES.map(({ id, icon, label }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              className="mdbtn"
              onClick={() => switchMode(id, { focusDur, breakDur, longBreakDur })}
              style={{
                ...b, padding: "8px 18px", borderRadius: 100,
                background: active ? modeBg(id) : "transparent",
                color: active ? modeAccent(id) : T.muted,
                fontSize: 12, fontWeight: 700, gap: 6, letterSpacing: ".04em",
                cursor: isRunning ? "not-allowed" : "pointer",
                opacity: isRunning && !active ? 0.5 : 1,
              }}
            >
              {icon}{label}
            </button>
          );
        })}
      </div>

      {/* ── ring ── */}
      <div style={{
        position: "relative",
        width: "min(420px, 38vw, 78vh)",
        height: "min(420px, 38vw, 78vh)",
        aspectRatio: "1/1",
      }}>
        <svg
          viewBox="0 0 272 272"
          style={{ transform: "rotate(-90deg)", display: "block", width: "100%", height: "100%" }}
        >
          <circle cx={136} cy={136} r={R} fill="none" stroke={T.ring0} strokeWidth={9}/>
          {[...Array(60)].map((_, i) => {
            const a     = (i / 60) * 2 * Math.PI - Math.PI / 2;
            const inner = i % 5 === 0 ? R - 14 : R - 8;
            return (
              <line key={i}
                x1={136 + R     * Math.cos(a + Math.PI / 2)}
                y1={136 + R     * Math.sin(a + Math.PI / 2)}
                x2={136 + inner * Math.cos(a + Math.PI / 2)}
                y2={136 + inner * Math.sin(a + Math.PI / 2)}
                stroke={T.ring0}
                strokeWidth={i % 5 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
          <circle
            cx={136} cy={136} r={R}
            fill="none" stroke={accent} strokeWidth={9}
            strokeDasharray={`${dash} ${CIRC}`}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 14px ${glow})`,
              transition: "stroke-dasharray 0.85s cubic-bezier(.4,0,.2,1), stroke 0.5s ease",
            }}
          />
        </svg>

        {/* ── centre label ── */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {timerFormat === "mmss" ? (
            <span style={{
              fontSize: "clamp(64px, 9vw, 104px)", fontWeight: 400,
              color: T.text, fontFamily: "'DM Serif Display',serif",
              letterSpacing: "-2px", lineHeight: 1,
            }}>
              {mm}:{ss}
            </span>
          ) : (
            <span style={{
              fontSize: "clamp(58px, 8.5vw, 96px)", fontWeight: 400,
              color: T.text, fontFamily: "'DM Serif Display',serif",
              letterSpacing: "-2px", lineHeight: 1,
            }}>
              {pct}<span style={{ fontSize: "0.45em", color: T.muted, marginLeft: 2 }}>%</span>
            </span>
          )}
          <span style={{ fontSize: 12, color: T.muted, letterSpacing: ".24em", fontWeight: 600 }}>
            {modeLabel}
          </span>
        </div>
      </div>

      {/* ── controls ── */}
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
    </>
  );
}