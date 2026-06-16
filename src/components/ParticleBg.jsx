import { useRef, useEffect } from "react";

export function ParticleBg({ dark }) {
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