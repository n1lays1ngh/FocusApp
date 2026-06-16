import { useState, useEffect, useRef } from "react";
import {
  Play, Pause, RotateCcw, Settings, BarChart2, X,
  Coffee, Brain, Flame, Clock, CheckCircle2, TrendingUp,
  ChevronUp, ChevronDown, Timer,
} from "lucide-react";

const STORAGE_KEY = "pomoflow_v1_metrics";

const defaultMetrics = {
  totalFocusMinutes: 0,
  sessionsCompleted: 0,
  lastActiveDate: null,
  currentStreak: 0,
};

function loadMetrics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultMetrics, ...JSON.parse(raw) } : { ...defaultMetrics };
  } catch {
    return { ...defaultMetrics };
  }
}

function saveMetrics(m) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch {}
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function nextStreak(m) {
  const today = todayStr();
  if (!m.lastActiveDate) return 1;
  const diff = Math.round(
    (new Date(today) - new Date(m.lastActiveDate)) / 86_400_000
  );
  if (diff === 0) return m.currentStreak;
  if (diff === 1) return m.currentStreak + 1;
  return 1;
}

const RING_R = 108;
const RING_CIRC = 2 * Math.PI * RING_R;

export default function App() {
  const [focusDur, setFocusDur]     = useState(25);
  const [breakDur, setBreakDur]     = useState(5);
  const [mode, setMode]             = useState("focus");
  const [timeLeft, setTimeLeft]     = useState(25 * 60);
  const [isRunning, setIsRunning]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats]   = useState(false);
  const [metrics, setMetrics]       = useState(loadMetrics);
  const [pulse, setPulse]           = useState(false);

  const modeRef     = useRef(mode);
  const focusRef    = useRef(focusDur);
  const breakRef    = useRef(breakDur);
  modeRef.current   = mode;
  focusRef.current  = focusDur;
  breakRef.current  = breakDur;

  const totalSecs = mode === "focus" ? focusDur * 60 : breakDur * 60;
  const progress  = 1 - timeLeft / totalSecs;
  const dash      = progress * RING_CIRC;
  const mins      = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs      = String(timeLeft % 60).padStart(2, "0");
  const isFocus   = mode === "focus";

  const accent  = isFocus ? "#a78bfa" : "#34d399";
  const accent2 = isFocus ? "#7c3aed" : "#059669";
  const glow    = isFocus ? "rgba(167,139,250,0.35)" : "rgba(52,211,153,0.3)";

  useEffect(() => {
    document.title = `${mins}:${secs} | ${isFocus ? "Focus" : "Break"} — PomoFlow`;
  }, [timeLeft, mode]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        if (modeRef.current === "focus") {
          setMetrics(m => {
            const updated = {
              ...m,
              totalFocusMinutes: m.totalFocusMinutes + focusRef.current,
              sessionsCompleted: m.sessionsCompleted + 1,
              lastActiveDate: todayStr(),
              currentStreak: nextStreak(m),
            };
            saveMetrics(updated);
            return updated;
          });
          setPulse(true);
          setTimeout(() => setPulse(false), 700);
          setMode("break");
          return breakRef.current * 60;
        } else {
          setMode("focus");
          return focusRef.current * 60;
        }
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const togglePlay = () => setIsRunning(r => !r);

  const handleReset = () => {
    setIsRunning(false);
    setMode("focus");
    setTimeLeft(focusDur * 60);
  };

  const setFocus = v => {
    const n = Math.max(1, Math.min(99, v));
    setFocusDur(n);
    if (!isRunning && mode === "focus") setTimeLeft(n * 60);
  };

  const setBreak = v => {
    const n = Math.max(1, Math.min(30, v));
    setBreakDur(n);
    if (!isRunning && mode === "break") setTimeLeft(n * 60);
  };

  const switchMode = (m) => {
    if (isRunning) return;
    setMode(m);
    setTimeLeft((m === "focus" ? focusDur : breakDur) * 60);
  };

  const btnBase = {
    border: "none", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", transition: "all 0.2s",
    fontFamily: "inherit",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Syne:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b18; }
        .ctrl-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .ctrl-btn:active { transform: scale(0.94); }
        .play-btn:hover { filter: brightness(1.12); }
        .play-btn:active { transform: scale(0.96); }
        .mode-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .stats-btn:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.18) !important; color: rgba(255,255,255,0.75) !important; }
        .step-btn:hover { background: rgba(255,255,255,0.14) !important; }
        .step-btn:active { transform: scale(0.92); }
        .close-btn:hover { background: rgba(255,255,255,0.1) !important; }
        @keyframes ring-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .pulse-ring { animation: ring-pulse 0.7s ease; }
        @keyframes fade-in { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .fade-in { animation: fade-in 0.25s ease; }
        @keyframes modal-in { from { opacity:0; transform: scale(0.96) translateY(12px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .modal-in { animation: modal-in 0.22s ease; }
      `}</style>

      {/* Root */}
      <div style={{
        minHeight: "100vh", width: "100%",
        background: "linear-gradient(145deg, #080b18 0%, #0e1230 45%, #120826 80%, #080b18 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Syne', sans-serif", position: "relative", overflow: "hidden", padding: "24px 16px",
      }}>

        {/* Ambient orbs */}
        <div style={{ position:"absolute", top:"8%", left:"12%", width:480, height:480, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(109,40,217,0.11) 0%, transparent 68%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"8%", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 68%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"55%", left:"5%", width:240, height:240, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 68%)", pointerEvents:"none" }} />

        {/* Wordmark */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:36 }}>
          <Timer size={17} color={accent} strokeWidth={2.2} />
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:12, fontWeight:700, letterSpacing:"0.22em" }}>POMOFLOW</span>
        </div>

        {/* Glass card */}
        <div style={{
          background: "rgba(255,255,255,0.028)",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.075)",
          borderRadius: 36,
          padding: "44px 48px 40px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
          width: "min(400px, 95vw)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}>

          {/* Mode selector */}
          <div style={{
            display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:100, padding:4, gap:3,
          }}>
            {[
              { id:"focus", icon:<Brain size={13}/>, label:"Focus" },
              { id:"break", icon:<Coffee size={13}/>, label:"Break" },
            ].map(({ id, icon, label }) => {
              const active = mode === id;
              const c = id === "focus" ? "#a78bfa" : "#34d399";
              return (
                <button key={id} className="mode-btn" onClick={() => switchMode(id)} style={{
                  ...btnBase, padding:"7px 22px", borderRadius:100,
                  background: active ? (id === "focus" ? "rgba(167,139,250,0.18)" : "rgba(52,211,153,0.18)") : "transparent",
                  color: active ? c : "rgba(255,255,255,0.38)",
                  fontSize:12, fontWeight:700, gap:6, letterSpacing:"0.05em",
                  cursor: isRunning ? "not-allowed" : "pointer",
                }}>
                  {icon}{label}
                </button>
              );
            })}
          </div>

          {/* Ring timer */}
          <div style={{ position:"relative", width:256, height:256 }}>
            <svg width={256} height={256} viewBox="0 0 256 256" style={{ transform:"rotate(-90deg)", display:"block" }}>
              <circle cx={128} cy={128} r={RING_R} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth={9} />
              <circle
                cx={128} cy={128} r={RING_R}
                fill="none"
                stroke={accent}
                strokeWidth={9}
                strokeDasharray={`${dash} ${RING_CIRC}`}
                strokeLinecap="round"
                className={pulse ? "pulse-ring" : ""}
                style={{
                  filter: `drop-shadow(0 0 10px ${glow})`,
                  transition: "stroke-dasharray 0.85s cubic-bezier(.4,0,.2,1), stroke 0.5s ease",
                }}
              />
            </svg>
            <div style={{
              position:"absolute", inset:0, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:4,
            }}>
              <span style={{
                fontSize:58, fontWeight:400, color:"#f1f5f9",
                fontFamily:"'DM Serif Display', serif", letterSpacing:"-1px", lineHeight:1,
              }}>
                {mins}:{secs}
              </span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.22em", fontWeight:600 }}>
                {isFocus ? "DEEP FOCUS" : "REST TIME"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <button className="ctrl-btn" onClick={handleReset} style={{
              ...btnBase, width:46, height:46, borderRadius:"50%",
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.09)",
              color:"rgba(255,255,255,0.55)",
            }}>
              <RotateCcw size={17} strokeWidth={2.2} />
            </button>

            <button className="play-btn" onClick={togglePlay} style={{
              ...btnBase, width:70, height:70, borderRadius:"50%",
              background: `linear-gradient(140deg, ${accent} 0%, ${accent2} 100%)`,
              color:"#fff",
              boxShadow: `0 6px 28px ${glow}, 0 0 0 1px rgba(255,255,255,0.08)`,
              fontSize:0,
            }}>
              {isRunning
                ? <Pause size={26} strokeWidth={2.2} />
                : <Play size={26} strokeWidth={2.2} style={{ marginLeft:3 }} />
              }
            </button>

            <button className="ctrl-btn" onClick={() => setShowSettings(s => !s)} style={{
              ...btnBase, width:46, height:46, borderRadius:"50%",
              background: showSettings ? "rgba(167,139,250,0.14)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${showSettings ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.09)"}`,
              color: showSettings ? "#a78bfa" : "rgba(255,255,255,0.55)",
            }}>
              <Settings size={17} strokeWidth={2.2} />
            </button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="fade-in" style={{
              width:"100%",
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:20, padding:"18px 22px",
              display:"flex", flexDirection:"column", gap:14,
            }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:"0.2em", fontWeight:700 }}>
                TIMER SETTINGS
              </p>
              {[
                { label:"Focus Session", icon:<Brain size={13}/>, val:focusDur, set:setFocus, col:"#a78bfa" },
                { label:"Short Break", icon:<Coffee size={13}/>, val:breakDur, set:setBreak, col:"#34d399" },
              ].map(({ label, icon, val, set, col }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"rgba(255,255,255,0.55)" }}>
                    <span style={{ color:col }}>{icon}</span>
                    {label}
                    <span style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>min</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button className="step-btn" onClick={() => set(val - 1)} style={{
                      ...btnBase, width:26, height:26, borderRadius:"50%",
                      background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.7)",
                    }}>
                      <ChevronDown size={13} strokeWidth={2.5} />
                    </button>
                    <span style={{ color:"#f1f5f9", fontWeight:800, fontSize:17, minWidth:28, textAlign:"center" }}>
                      {val}
                    </span>
                    <button className="step-btn" onClick={() => set(val + 1)} style={{
                      ...btnBase, width:26, height:26, borderRadius:"50%",
                      background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.7)",
                    }}>
                      <ChevronUp size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats trigger */}
        <button className="stats-btn" onClick={() => setShowStats(true)} style={{
          ...btnBase, marginTop:28, gap:7,
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.09)",
          borderRadius:100, padding:"9px 22px",
          color:"rgba(255,255,255,0.42)", fontSize:12, fontWeight:600, letterSpacing:"0.06em",
          backdropFilter:"blur(8px)",
        }}>
          <BarChart2 size={14} strokeWidth={2.2} />
          View Lifetime Stats
        </button>
      </div>

      {/* Stats modal */}
      {showStats && (
        <div onClick={() => setShowStats(false)} style={{
          position:"fixed", inset:0,
          background:"rgba(0,0,0,0.65)",
          backdropFilter:"blur(10px)",
          WebkitBackdropFilter:"blur(10px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:200, padding:16,
        }}>
          <div className="modal-in" onClick={e => e.stopPropagation()} style={{
            background:"rgba(12,15,35,0.97)",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:30, padding:"36px 36px 32px",
            width:"min(380px, 95vw)",
            display:"flex", flexDirection:"column", gap:24,
            boxShadow:"0 40px 100px rgba(0,0,0,0.6)",
            fontFamily:"'Syne', sans-serif",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"0.22em", fontWeight:700 }}>
                  LIFETIME STATS
                </span>
                <h2 style={{ color:"#f1f5f9", fontSize:22, fontWeight:800, letterSpacing:"-0.3px" }}>
                  Your Progress
                </h2>
              </div>
              <button className="close-btn" onClick={() => setShowStats(false)} style={{
                ...btnBase, width:34, height:34, borderRadius:"50%",
                background:"rgba(255,255,255,0.06)",
                color:"rgba(255,255,255,0.45)",
              }}>
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { icon:<Clock size={19} color="#a78bfa" strokeWidth={2}/>, label:"Minutes Focused", value:metrics.totalFocusMinutes, unit:"min" },
                { icon:<CheckCircle2 size={19} color="#34d399" strokeWidth={2}/>, label:"Sessions Done", value:metrics.sessionsCompleted, unit:"" },
                { icon:<Flame size={19} color="#fb923c" strokeWidth={2}/>, label:"Day Streak", value:metrics.currentStreak, unit:"days" },
                { icon:<TrendingUp size={19} color="#60a5fa" strokeWidth={2}/>, label:"Hours Focused", value:(metrics.totalFocusMinutes / 60).toFixed(1), unit:"hrs" },
              ].map(({ icon, label, value, unit }) => (
                <div key={label} style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:18, padding:"16px 16px 14px",
                  display:"flex", flexDirection:"column", gap:10,
                }}>
                  {icon}
                  <div>
                    <p style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", lineHeight:1, letterSpacing:"-0.5px" }}>
                      {value}
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginLeft:4, fontWeight:600 }}>{unit}</span>
                    </p>
                    <p style={{ marginTop:4, fontSize:11, color:"rgba(255,255,255,0.38)", fontWeight:500 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
              borderRadius:14, padding:"12px 16px",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontWeight:500 }}>Last active</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)", fontWeight:600 }}>
                {metrics.lastActiveDate
                  ? new Date(metrics.lastActiveDate + "T12:00:00").toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" })
                  : "—"
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}