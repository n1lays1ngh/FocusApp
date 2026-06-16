export const SK = "pomoflow_v2_metrics";
export const DEF = { totalFocusMinutes: 0, sessionsCompleted: 0, lastActiveDate: null, currentStreak: 0 };
export const load = () => { try { const r = localStorage.getItem(SK); return r ? { ...DEF, ...JSON.parse(r) } : { ...DEF }; } catch { return { ...DEF }; } };
export const save = m => { try { localStorage.setItem(SK, JSON.stringify(m)); } catch {} };
export const today = () => new Date().toISOString().split("T")[0];
export const streak = m => {
  if (!m.lastActiveDate) return 1;
  const d = Math.round((new Date(today()) - new Date(m.lastActiveDate)) / 86_400_000);
  return d === 0 ? m.currentStreak : d === 1 ? m.currentStreak + 1 : 1;
};