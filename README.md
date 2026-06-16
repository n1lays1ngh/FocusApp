<div align="center">

# *Pomo*Flow

**Deep work, on a timer.**

[**Live App →**](https://pomoflow-black.vercel.app/)

![PomoFlow](https://img.shields.io/badge/built%20with-React-61dafb?style=flat-square&logo=react)
![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/license-MIT-c94a2b?style=flat-square)

</div>

---

## What is PomoFlow?

PomoFlow is a minimal, beautiful Pomodoro timer built for people who take deep work seriously. No accounts, no subscriptions, no bloat — just you, a countdown, and a streak worth protecting.

It lives at **[pomoflow-black.vercel.app](https://pomoflow-black.vercel.app/)**.

---

## Features

### Timer
- **Focus, Short Break, and Long Break** modes with a fluid animated ring
- Automatically advances to a long break after every N focus sessions (configurable)
- **Auto-start** option so sessions flow without interruption
- **Two display formats** — classic `MM:SS` countdown or a `%` remaining label
- Keyboard shortcuts: `Space` to play/pause, `R` to reset

### Settings
- Configurable durations for focus (1–99 min), short break (1–30 min), and long break (5–60 min)
- Set how many focus sessions trigger a long break (2–10)
- Choose your notification sound — **Bell**, **Chime**, **Soft**, or **None** — with an instant preview on selection
- All settings are local, no account needed

### Stats
- Lifetime focus hours tracked in `localStorage`
- Weekly, monthly, and yearly charts powered by Chart.js
- Session count, current streak, and last active date
- Zero data leaves your browser

### Polish
- Warm earth-tone palette with full **dark mode**
- Animated particle background
- Typewriter quote cycling every few seconds
- Smooth modal animations throughout
- Fully responsive down to mobile

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (Vite) |
| Styling | Inline styles + CSS-in-JS (no stylesheet dependencies) |
| Charts | Chart.js via `chart.js/auto` |
| Icons | Lucide React |
| Audio | Web Audio API (zero dependencies) |
| Storage | `localStorage` |
| Fonts | DM Serif Display · Syne (Google Fonts) |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── App.jsx                  # Root — state, layout, theme tokens
├── components/
│   ├── TimerDisplay.jsx     # SVG ring, mode pill, playback controls
│   ├── SettingsModal.jsx    # Floating settings overlay
│   ├── StatsModal.jsx       # Stats overlay with Chart.js bar chart
│   ├── TypewriterQuote.jsx  # Self-rotating typewriter quote
│   └── ParticleBg.jsx       # Animated canvas background
├── hooks/
│   ├── useTimer.js          # Countdown logic, sound, session tracking
│   ├── useMetrics.js        # localStorage metrics + session log
│   └── useClock.js          # Live clock state
├── constants/
│   └── quotes.js            # Quote pool for the typewriter
└── utils/
    └── persistence.js       # load, save, streak helpers
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/your-username/pomoflow.git
cd pomoflow

# Install
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

The app runs entirely in the browser. No backend, no environment variables needed.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `R` | Reset to focus |

---

## Tuning

A few values worth knowing if you want to customise the feel:

| What | File | What to change |
|---|---|---|
| Quote rotation speed | `TypewriterQuote.jsx` | The `5000` ms value in the `setTimeout` |
| Typing speed | `TypewriterQuote.jsx` | `26 + Math.random() * 18` delay per character |
| Notification sounds | `useTimer.js` | Frequency, gain, and decay in the `configs` object |
| Default durations | `App.jsx` | The `useState(25)`, `useState(5)`, `useState(15)` initialisers |
| Sessions until long break | `App.jsx` | `useState(4)` |

---

## License

MIT — do whatever you like with it.

---

<div align="center">

Built with focus. Use it with intention.

**[pomoflow-black.vercel.app](https://pomoflow-black.vercel.app/)**

</div>