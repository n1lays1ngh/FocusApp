import { useState, useEffect, useRef } from "react";
import { QUOTES } from "../constants/quotes";

export function TypewriterQuote({ T, accent }) {
  const [quote, setQuote]   = useState(QUOTES[0]);
  const [display, setDisplay] = useState("");
  const [phase, setPhase]   = useState("typing");
  const idxRef  = useRef(0);
  const quoteRef = useRef(quote);
  quoteRef.current = quote;

  /* ── auto-rotate every 5 seconds after typing finishes ── */
  useEffect(() => {
    if (phase !== "done") return;

    const id = setTimeout(() => {          // ← CHANGE THIS VALUE to tune the delay
      setQuote(q => {                      //   e.g. 8000 = 8 seconds, 3000 = 3 seconds
        let next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        if (QUOTES.length > 1 && next === q)
          next = QUOTES[(QUOTES.indexOf(q) + 1) % QUOTES.length];
        return next;
      });
    }, 600000);                              // ← THE 5-SECOND TIMER IS HERE

    return () => clearTimeout(id);
  }, [phase]);

  /* ── reset typewriter when quote changes ── */
  useEffect(() => {
    idxRef.current = 0;
    setDisplay("");
    setPhase("typing");
  }, [quote]);

  /* ── typewriter tick ── */
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
      fontSize: 18, color: T.text, lineHeight: 1.55, fontWeight: 500,
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