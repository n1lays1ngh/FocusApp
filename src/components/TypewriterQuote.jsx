import { useState, useEffect, useRef } from "react";

export function TypewriterQuote({ quote, T, accent }) {
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