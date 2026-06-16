import { useState, useEffect } from "react";
import {
  X, Brain, Coffee, Moon, Zap, Bell, Wind, Music, VolumeX,
  ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Clock, Timer,
} from "lucide-react";

export function SettingsModal({
  T, accent, accent2, dark, onClose,
  focusDur, breakDur, setFoc, setBrk,
  longBreakDur, setLongBreakDur,
  sessionsUntilLongBreak, setSessionsUntilLongBreak,
  autoStart, setAutoStart,
  notificationSound, setNotificationSound,
  timerFormat, setTimerFormat,
  onPreviewSound,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const b = {
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.22s", fontFamily: "inherit",
  };

  const SOUNDS = [
    { id: "bell",  label: "Bell",  icon: <Bell    size={14}/> },
    { id: "chime", label: "Chime", icon: <Music   size={14}/> },
    { id: "soft",  label: "Soft",  icon: <Wind    size={14}/> },
    { id: "none",  label: "None",  icon: <VolumeX size={14}/> },
  ];

  const Stepper = ({ val, onDec, onInc, min = 1, max = 99 }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={onDec} disabled={val <= min}
        style={{
          ...b, width: 28, height: 28, borderRadius: "50%",
          background: T.ctrl, color: val <= min ? T.subtle : T.text,
          border: `1px solid ${T.ctrlBdr}`,
          opacity: val <= min ? 0.4 : 1,
          cursor: val <= min ? "not-allowed" : "pointer",
        }}
      >
        <ChevronDown size={13} strokeWidth={2.5}/>
      </button>
      <span style={{
        color: T.text, fontWeight: 800, fontSize: 16,
        minWidth: 32, textAlign: "center", letterSpacing: "-.3px",
      }}>
        {val}
      </span>
      <button
        onClick={onInc} disabled={val >= max}
        style={{
          ...b, width: 28, height: 28, borderRadius: "50%",
          background: T.ctrl, color: val >= max ? T.subtle : T.text,
          border: `1px solid ${T.ctrlBdr}`,
          opacity: val >= max ? 0.4 : 1,
          cursor: val >= max ? "not-allowed" : "pointer",
        }}
      >
        <ChevronUp size={13} strokeWidth={2.5}/>
      </button>
    </div>
  );

  const Row = ({ icon, iconColor, label, sublabel, children, delay = 0 }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: `opacity 0.3s ease ${delay}s, transform 0.3s ease ${delay}s`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: iconColor }}>{icon}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{label}</span>
          {sublabel && (
            <span style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>{sublabel}</span>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  const Divider = () => (
    <div style={{ height: 1, background: T.divider, margin: "2px 0" }}/>
  );

  const SectionLabel = ({ text }) => (
    <p style={{
      fontSize: 9.5, color: T.muted, letterSpacing: ".22em",
      fontWeight: 700, textTransform: "uppercase", paddingBottom: 2,
    }}>
      {text}
    </p>
  );

  const Card = ({ children, delay = 0 }) => (
    <div style={{
      background: T.inputRow, border: `1px solid ${T.subtle}`,
      borderRadius: 16, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 14,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: `opacity 0.3s ease ${delay}s, transform 0.3s ease ${delay}s`,
    }}>
      {children}
    </div>
  );

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0,
        background: dark ? "rgba(0,0,0,0.7)" : "rgba(100,50,20,0.35)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: 16,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.modal,
          border: `1px solid ${T.cardBdr}`,
          borderRadius: 28,
          padding: "28px 28px 24px",
          width: "min(440px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 20,
          fontFamily: "'Syne', sans-serif",
          boxShadow: dark
            ? "0 40px 100px rgba(0,0,0,0.65)"
            : "0 24px 80px rgba(100,40,20,0.22)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, color: T.muted, letterSpacing: ".22em", fontWeight: 700 }}>CONFIGURATION</span>
            <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, letterSpacing: "-.3px" }}>Timer Settings</h2>
          </div>
          <button
            onClick={handleClose}
            style={{ ...b, width: 33, height: 33, borderRadius: "50%", background: T.ctrl, color: T.muted }}
          >
            <X size={15} strokeWidth={2.2}/>
          </button>
        </div>

        {/* durations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionLabel text="Session Durations" />
          <Card delay={0.04}>
            <Row icon={<Brain size={14}/>} iconColor="#c94a2b" label="Focus" sublabel="minutes" delay={0.06}>
              <Stepper val={focusDur} min={1} max={99}
                onDec={() => setFoc(focusDur - 1)} onInc={() => setFoc(focusDur + 1)}/>
            </Row>
            <Divider/>
            <Row icon={<Coffee size={14}/>} iconColor="#c4922a" label="Short Break" sublabel="minutes" delay={0.10}>
              <Stepper val={breakDur} min={1} max={30}
                onDec={() => setBrk(breakDur - 1)} onInc={() => setBrk(breakDur + 1)}/>
            </Row>
            <Divider/>
            <Row icon={<Moon size={14}/>} iconColor="#4a7fa5" label="Long Break" sublabel="minutes" delay={0.14}>
              <Stepper val={longBreakDur} min={5} max={60}
                onDec={() => setLongBreakDur(v => Math.max(5,  v - 1))}
                onInc={() => setLongBreakDur(v => Math.min(60, v + 1))}/>
            </Row>
            <Divider/>
            <Row icon={<Zap size={14}/>} iconColor={accent} label="Sessions until long break" sublabel="focus sessions per cycle" delay={0.18}>
              <Stepper val={sessionsUntilLongBreak} min={2} max={10}
                onDec={() => setSessionsUntilLongBreak(v => Math.max(2,  v - 1))}
                onInc={() => setSessionsUntilLongBreak(v => Math.min(10, v + 1))}/>
            </Row>
          </Card>
        </div>

        {/* behavior */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionLabel text="Behavior" />
          <Card delay={0.08}>
            <Row
              icon={<Zap size={14}/>}
              iconColor={autoStart ? accent : T.muted}
              label="Auto-start next session"
              sublabel={autoStart ? "Sessions start automatically" : "Press play to start each session"}
              delay={0.22}
            >
              <button
                onClick={() => setAutoStart(v => !v)}
                style={{ ...b, background: "none", padding: 0, color: autoStart ? accent : T.subtle }}
              >
                {autoStart
                  ? <ToggleRight size={30} strokeWidth={1.8}/>
                  : <ToggleLeft  size={30} strokeWidth={1.8}/>}
              </button>
            </Row>
            <Divider/>
            <Row
              icon={<Timer size={14}/>}
              iconColor={T.muted}
              label="Timer display"
              sublabel={timerFormat === "mmss" ? "Shows MM:SS countdown" : "Shows % remaining"}
              delay={0.26}
            >
              <div style={{ display: "flex", background: T.pill, borderRadius: 100, padding: 3, gap: 2 }}>
                {[
                  { id: "mmss",    label: "MM:SS", icon: <Clock size={11}/> },
                  { id: "percent", label: "%",     icon: <Timer size={11}/> },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setTimerFormat(opt.id)}
                    style={{
                      ...b, gap: 4, padding: "5px 10px", borderRadius: 100,
                      background: timerFormat === opt.id
                        ? (dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)")
                        : "transparent",
                      color: timerFormat === opt.id ? T.text : T.muted,
                      fontSize: 11, fontWeight: 700, letterSpacing: ".03em",
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </Row>
          </Card>
        </div>

        {/* sound */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionLabel text="Notification Sound" />
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.3s ease 0.30s, transform 0.3s ease 0.30s",
          }}>
            {SOUNDS.map(s => {
              const active = notificationSound === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setNotificationSound(s.id);
                    if (s.id !== "none") onPreviewSound(s.id);
                  }}
                  style={{
                    ...b, flexDirection: "column", gap: 7,
                    padding: "14px 8px", borderRadius: 14,
                    background: active
                      ? (dark ? "rgba(201,74,43,0.15)" : "rgba(201,74,43,0.10)")
                      : T.inputRow,
                    border: `1px solid ${active ? accent + "66" : T.subtle}`,
                    color: active ? accent : T.muted,
                    fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
                    transition: "all 0.18s ease",
                  }}
                >
                  {s.icon}
                  {s.label}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 10.5, color: T.muted, textAlign: "center", letterSpacing: ".04em" }}>
            Tap a sound to preview it
          </p>
        </div>

      </div>
    </div>
  );
}