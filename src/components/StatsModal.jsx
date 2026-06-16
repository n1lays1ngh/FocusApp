import { useState, useEffect, useRef } from "react";
import { Clock, CheckCircle2, Flame, X } from "lucide-react";
import Chart from "chart.js/auto";

const PERIOD_LABELS = {
  week:  "Hours focused — this week",
  month: "Hours focused — past 4 weeks",
  year:  "Hours focused — past 12 months",
};

function loadLog() {
  try { const r = localStorage.getItem("pomoflow_session_log"); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

function groupByDay(entries) {
  const map = {};
  entries.forEach(e => { map[e.date] = (map[e.date] || 0) + e.minutes; });
  return map;
}

function getWeekData(log) {
  const now = new Date(), days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const labels = [], data = [], byDay = groupByDay(log);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    labels.push(days[d.getDay()]);
    data.push(Math.round((byDay[key] || 0) / 60 * 10) / 10);
  }
  return { labels, data };
}

function getMonthData(log) {
  const now = new Date(), labels = [], data = [], byDay = groupByDay(log);
  for (let w = 3; w >= 0; w--) {
    let weekMins = 0;
    for (let d = 6; d >= 0; d--) {
      const day = new Date(now); day.setDate(day.getDate() - (w * 7 + d));
      weekMins += (byDay[day.toISOString().split("T")[0]] || 0);
    }
    const ws = new Date(now); ws.setDate(ws.getDate() - (w * 7 + 6));
    labels.push(ws.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    data.push(Math.round(weekMins / 60 * 10) / 10);
  }
  return { labels, data };
}

function getYearData(log) {
  const now = new Date(), mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const labels = [], data = [], byDay = groupByDay(log);
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const yr = d.getFullYear(), mn = d.getMonth();
    let total = 0;
    const days = new Date(yr, mn + 1, 0).getDate();
    for (let day = 1; day <= days; day++) {
      const key = `${yr}-${String(mn+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      total += (byDay[key] || 0);
    }
    labels.push(mo[mn]);
    data.push(Math.round(total / 60 * 10) / 10);
  }
  return { labels, data };
}

function getStatsFor(period, log) {
  const now = new Date(), todayKey = now.toISOString().split("T")[0];
  const c = new Date(now);
  if (period === "week") c.setDate(c.getDate() - 6);
  else if (period === "month") c.setDate(c.getDate() - 29);
  else c.setFullYear(c.getFullYear() - 1);
  const cutoff = c.toISOString().split("T")[0];
  const filtered = log.filter(e => e.date >= cutoff && e.date <= todayKey);
  return {
    totalMins: filtered.reduce((s, e) => s + e.minutes, 0),
    sessions: filtered.length,
  };
}

export function StatsModal({ metrics, T, accent, accent2, dark, onClose }) {
  const [period, setPeriod] = useState("week");
  const [visible, setVisible] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const log = loadLog();

  /* ── open animation ── */
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ── close with animation ── */
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  /* ── close on Escape key ── */
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { totalMins, sessions } = getStatsFor(period, log);
  const pd = period === "week" ? getWeekData(log) : period === "month" ? getMonthData(log) : getYearData(log);
  const totalHrs = pd.data.reduce((a, b) => a + b, 0).toFixed(1);

  /* ── chart ── */
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const max = Math.max(...pd.data, 0.5);
    chartInstance.current = new Chart(chartRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: pd.labels,
        datasets: [{
          data: pd.data,
          backgroundColor: pd.data.map(v => v > 0 ? "rgba(201,74,43,0.75)" : "rgba(201,74,43,0.1)"),
          hoverBackgroundColor: "rgba(201,74,43,0.95)",
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        animation: { duration: 500, easing: "easeOutQuart" },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: dark ? "#0e0704" : "#1a0e06",
            titleColor: "rgba(245,237,224,0.5)",
            bodyColor: "#f5ede0", padding: 10, cornerRadius: 10,
            callbacks: { label: ctx => `${ctx.parsed.y} hrs` }
          }
        },
        scales: {
          x: {
            grid: { display: false }, border: { display: false },
            ticks: { color: T.muted, font: { size: 11, weight: "600", family: "'Syne', sans-serif" } }
          },
          y: {
            min: 0, max: Math.ceil(max * 1.25 * 10) / 10,
            grid: { color: T.subtle, lineWidth: 0.5 },
            border: { display: false },
            ticks: { color: T.muted, font: { size: 10, family: "'Syne', sans-serif" }, maxTicksLimit: 4, callback: v => v + "h" }
          }
        }
      }
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [period, dark]);

  const b = { border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.22s", fontFamily: "inherit" };

  const focusDisplay = totalMins >= 60
    ? { val: (totalMins / 60).toFixed(1), unit: "hrs" }
    : { val: totalMins, unit: "min" };

  const periodLabel = period === "week" ? "This week" : period === "month" ? "Past 30 days" : "Past year";

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
          width: "min(1080px, 95vw)",
          display: "flex", flexDirection: "column", gap: 20,
          fontFamily: "'Syne', sans-serif",
          boxShadow: dark ? "0 40px 100px rgba(0,0,0,0.65)" : "0 24px 80px rgba(100,40,20,0.22)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, color: T.muted, letterSpacing: ".22em", fontWeight: 700 }}>STATISTICS</span>
            <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, letterSpacing: "-.3px" }}>Your Progress</h2>
          </div>
          <button onClick={handleClose} style={{ ...b, width: 33, height: 33, borderRadius: "50%", background: T.ctrl, color: T.muted }}>
            <X size={15} strokeWidth={2.2} />
          </button>
        </div>

        {/* period pills */}
        <div style={{ display: "flex", background: T.pill, borderRadius: 100, padding: 4, gap: 2, alignSelf: "flex-start" }}>
          {["week", "month", "year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              ...b, padding: "7px 20px", borderRadius: 100,
              background: period === p ? "rgba(201,74,43,0.13)" : "transparent",
              color: period === p ? accent : T.muted,
              fontSize: 12, fontWeight: 700, letterSpacing: ".05em",
              transition: "background 0.2s ease, color 0.2s ease",
            }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { icon: <Clock size={17} color={accent} strokeWidth={2} />, val: focusDisplay.val, unit: focusDisplay.unit, label: "Focus time" },
            { icon: <CheckCircle2 size={17} color="#c4922a" strokeWidth={2} />, val: sessions, unit: "", label: periodLabel },
            { icon: <Flame size={17} color="#c94a2b" strokeWidth={2} />, val: metrics.currentStreak || 0, unit: "days", label: "Streak" },
          ].map(({ icon, val, unit, label }, i) => (
            <div key={label} style={{
              background: T.statCard, border: `1px solid ${T.subtle}`,
              borderRadius: 16, padding: "14px 14px 12px",
              display: "flex", flexDirection: "column", gap: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 0.35s ease ${0.08 + i * 0.06}s, transform 0.35s ease ${0.08 + i * 0.06}s`,
            }}>
              {icon}
              <p style={{ fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: "-.5px" }}>
                {val}<span style={{ fontSize: 11, color: T.muted, marginLeft: 3, fontWeight: 600 }}>{unit}</span>
              </p>
              <p style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* chart */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 0.22s, transform 0.35s ease 0.22s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".15em", color: T.muted, textTransform: "uppercase" }}>
              {PERIOD_LABELS[period]}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{totalHrs} hrs total</span>
          </div>
          <div style={{ position: "relative", width: "100%", height: 250 }}>
            <canvas ref={chartRef} />
          </div>
        </div>

        {/* last active */}
        <div style={{
          background: T.statCard, border: `1px solid ${T.subtle}`,
          borderRadius: 12, padding: "11px 15px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease 0.28s, transform 0.35s ease 0.28s",
        }}>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>Last session</span>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
            {metrics.lastActiveDate
              ? new Date(metrics.lastActiveDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}