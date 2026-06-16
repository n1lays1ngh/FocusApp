import { useState, useEffect, useRef } from "react";
import {
  Play, Pause, RotateCcw, Settings, BarChart2, X,
  Coffee, Brain, Flame, Clock, CheckCircle2, TrendingUp,
  ChevronUp, ChevronDown, Sun, Moon, Target, Volume2, VolumeX
} from "lucide-react";

/* ─── persistence ─────────────────────────────────────── */
const SK = "pomoflow_v2_metrics";
const DEF = { totalFocusMinutes: 0, sessionsCompleted: 0, lastActiveDate: null, currentStreak: 0 };
const load = () => { try { const r = localStorage.getItem(SK); return r ? { ...DEF, ...JSON.parse(r) } : { ...DEF }; } catch { return { ...DEF }; } };
const save = m => { try { localStorage.setItem(SK, JSON.stringify(m)); } catch {} };
const today = () => new Date().toISOString().split("T")[0];
const streak = m => {
  if (!m.lastActiveDate) return 1;
  const d = Math.round((new Date(today()) - new Date(m.lastActiveDate)) / 86_400_000);
  return d === 0 ? m.currentStreak : d === 1 ? m.currentStreak + 1 : 1;
};

/* ─── curated quotes ───────────────────────────────────── */
const QUOTES = [
  "Focus is a muscle, and you are building it right now.",
  "Protect your peace, protect your time.",
  "Simplicity is the ultimate sophistication.",
  "Deep work is the superpower of the 21st century.",
  "Where attention goes, energy flows.",
  "Do it now. Sometimes 'later' becomes 'never'.",
  "Be regular and orderly in your life, so that you may be violent and original in your work.",
];

/* ─── canvas particle bg ───────────────────────────────── */
function ParticleBg({ dark }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], raf;
    const mouse = { x: 0, y: 0 };

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });

    const lightCols = ["rgba(201,74,43,0.18)", "rgba(196,146,42,0.14)", "rgba(180,100,60,0.12)", "rgba(230,180,120,0.10)"];
    const darkCols  = ["rgba(201,74,43,0.22)", "rgba(196,146,42,0.16)", "rgba(120,50,20,0.18)",  "rgba(80,30,10,0.12)"];

    const mkParticle = () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 30 + Math.random() * 90,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      col: dark ? darkCols[Math.floor(Math.random() * darkCols.length)]
                : lightCols[Math.floor(Math.random() * lightCols.length)],
      phase: Math.random() * Math.PI * 2,
      speed: .004 + Math.random() * .006,
    });

    for (let i = 0; i < 26; i++) particles.push(mkParticle());

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const t = performance.now();
      particles.forEach(p => {
        const dx = (mouse.x - W / 2) * .012;
        const dy = (mouse.y - H / 2) * .012;
        p.x += p.vx + Math.sin(t * p.speed + p.phase) * .25 + dx * .008;
        p.y += p.vy + Math.cos(t * p.speed + p.phase) * .25 + dy * .008;
        if (p.x < -120) p.x = W + 120;
        if (p.x > W + 120) p.x = -120;
        if (p.y < -120) p.y = H + 120;
        if (p.y > H + 120) p.y = -120;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, p.col);
        g.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [dark]);

  return (
    <canvas ref={ref} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

/* ─── typewriter quote ─────────────────────────────────── */
function TypewriterQuote({ quote, T, accent }) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState("typing");
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplay("");
    setPhase("typing");
  }, [quote]);

  useEffect(() => {
    let t;
    if (phase === "typing") {
      if (idxRef.current < quote.length) {
        t = setTimeout(() => {
          idxRef.current += 1;
          setDisplay(quote.slice(0, idxRef.current));
        }, 26 + Math.random() * 18);
      } else {
        t = setTimeout(() => setPhase("pausing"), 2200);
      }
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("done"), 10);
    }
    return () => clearTimeout(t);
  }, [phase, display, quote]);

  return (
    <p style={{
      fontSize: 16, color: T.text, lineHeight: 1.55, fontWeight: 500,
      fontFamily: "'DM Serif Display', serif", fontStyle: "italic",
      minHeight: 78, letterSpacing: ".2px",
    }}>
      "{display}
      <span style={{
        display: "inline-block", width: 2, height: 16, background: accent,
        marginLeft: 3, transform: "translateY(2px)",
        opacity: phase === "typing" ? 1 : 0.55,
        animation: "blink 0.9s steps(1) infinite",
      }}/>
    </p>
  );
}

/* ─── ring constants ───────────────────────────────────── */
const R = 116, CIRC = 2 * Math.PI * R;

/* ─── main app ─────────────────────────────────────────── */
export default function App() {
  const [dark, setDark]             = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusDur, setFocusDur]     = useState(25);
  const [breakDur, setBreakDur]     = useState(5);
  const [mode, setMode]             = useState("focus");
  const [timeLeft, setTimeLeft]     = useState(25 * 60);
  const [isRunning, setIsRunning]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats]   = useState(false);
  const [metrics, setMetrics]       = useState(load);
  const [quote, setQuote]           = useState(QUOTES[0]);
  const [currentTask, setCurrentTask] = useState("");

  /* ── clock ──────────────────────────────────────────── */
  const [clockTime, setClockTime]   = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const modeRef  = useRef(mode);
  const focRef   = useRef(focusDur);
  const brkRef   = useRef(breakDur);
  modeRef.current = mode; focRef.current = focusDur; brkRef.current = breakDur;

  const isFocus    = mode === "focus";
  const totalSecs  = isFocus ? focusDur * 60 : breakDur * 60;
  const progress   = 1 - timeLeft / totalSecs;
  const dash       = progress * CIRC;
  const mm         = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss         = String(timeLeft % 60).padStart(2, "0");

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

  const changeQuote = () => {
    setQuote(q => {
      let next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      if (QUOTES.length > 1 && next === q) {
        next = QUOTES[(QUOTES.indexOf(q) + 1) % QUOTES.length];
      }
      return next;
    });
  };

  useEffect(() => {
    document.title = `${mm}:${ss} | ${isFocus ? "Focus" : "Break"} — PomoFlow`;
  }, [timeLeft, mode]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        playChime();
        changeQuote();
        if (modeRef.current === "focus") {
          setMetrics(m => {
            const u = { ...m, totalFocusMinutes: m.totalFocusMinutes + focRef.current,
              sessionsCompleted: m.sessionsCompleted + 1, lastActiveDate: today(), currentStreak: streak(m) };
            save(u); return u;
          });
          setMode("break"); return brkRef.current * 60;
        } else { setMode("focus"); return focRef.current * 60; }
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

  const togglePlay  = () => setIsRunning(r => !r);
  const handleReset = () => { setIsRunning(false); setMode("focus"); setTimeLeft(focusDur * 60); };
  const setFoc = v => { const n = Math.max(1, Math.min(99, v)); setFocusDur(n); if (!isRunning && mode === "focus") setTimeLeft(n * 60); };
  const setBrk = v => { const n = Math.max(1, Math.min(30, v)); setBreakDur(n); if (!isRunning && mode === "break") setTimeLeft(n * 60); };

  const switchMode = m => {
    if (isRunning) return;
    setMode(m);
    setTimeLeft((m === "focus" ? focusDur : breakDur) * 60);
    changeQuote();
  };

  const b = { border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.22s", fontFamily: "inherit" };

  const statItems = [
    { icon: <Clock  size={19} color={accent} strokeWidth={2}/>,  label: "Minutes Focused", value: metrics.totalFocusMinutes, unit: "min" },
    { icon: <CheckCircle2 size={19} color="#c4922a" strokeWidth={2}/>, label: "Sessions Done", value: metrics.sessionsCompleted, unit: "" },
    { icon: <Flame  size={19} color="#c94a2b" strokeWidth={2}/>, label: "Day Streak", value: metrics.currentStreak, unit: "days" },
    { icon: <TrendingUp size={19} color={accent2} strokeWidth={2}/>, label: "Hours Focused", value: (metrics.totalFocusMinutes / 60).toFixed(1), unit: "hrs" },
  ];

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
                  <button key={id} className="mdbtn" onClick={() => switchMode(id)} style={{
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

            {showSettings && (
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
            )}
          </div>
        </div>
      </div>

      {showStats && (
        <div onClick={() => setShowStats(false)} style={{
          position: "fixed", inset: 0,
          background: dark ? "rgba(0,0,0,0.7)" : "rgba(100,50,20,0.35)",
          backdropFilter: "blur(12px)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16,
        }}>
          <div className="mi" onClick={e => e.stopPropagation()} style={{
            background: T.modal,
            border: `1px solid ${T.cardBdr}`,
            borderRadius: 28, padding: "34px 34px 28px",
            width: "min(370px,95vw)",
            display: "flex", flexDirection: "column", gap: 20,
            fontFamily: "'Syne',sans-serif",
            boxShadow: dark ? "0 40px 100px rgba(0,0,0,0.65)" : "0 24px 80px rgba(100,40,20,0.22)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 10, color: T.muted, letterSpacing: ".22em", fontWeight: 700 }}>LIFETIME STATS</span>
                <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, letterSpacing: "-.3px" }}>Your Progress</h2>
              </div>
              <button onClick={() => setShowStats(false)} style={{
                ...b, width: 33, height: 33, borderRadius: "50%",
                background: T.ctrl, border: "none", color: T.muted,
              }}>
                <X size={15} strokeWidth={2.2}/>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {statItems.map(({ icon, label, value, unit }) => (
                <div key={label} style={{
                  background: T.statCard, border: `1px solid ${T.subtle}`,
                  borderRadius: 16, padding: "14px 15px",
                  display: "flex", flexDirection: "column", gap: 9,
                }}>
                  {icon}
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: "-.5px" }}>
                      {value}
                      <span style={{ fontSize: 12, color: T.muted, marginLeft: 4, fontWeight: 600 }}>{unit}</span>
                    </p>
                    <p style={{ marginTop: 4, fontSize: 11, color: T.muted, fontWeight: 500 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: T.statCard, border: `1px solid ${T.subtle}`,
              borderRadius: 12, padding: "11px 15px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>Last active</span>
              <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
                {metrics.lastActiveDate
                  ? new Date(metrics.lastActiveDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}