import { useEffect, useRef } from "react";
import { DIVS_X, DIVS_Y, SCROLL_PX_PER_SEC, formatFreq, scope, vpp } from "./scopeStore";

// Channel colours: the only colours outside the tokens.
const CH2 = "#E8A33D"; // amber, 60%

const rgbOf = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// The scope screen behind the site: a graticule, two channels that roll sideways,
// and phosphor-style trails. The mouse steers it: horizontal position sets the
// frequency, vertical position sets the amplitude. Typing in the terminal injects
// spikes. With reduced motion it draws one still frame.
const ScopeBackground = () => {
  const wrapRef = useRef(null);
  const gridRef = useRef(null);
  const traceRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const grid = gridRef.current;
    const trace = traceRef.current;
    const gctx = grid.getContext("2d");
    const tctx = trace.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const line = css.getPropertyValue("--border").trim();
    const ink = rgbOf(css.getPropertyValue("--text").trim());
    const CH1 = `rgba(${ink},0.7)`;

    let W = 0;
    let H = 0;
    let raf = 0;
    let last = performance.now();

    const drawGrid = () => {
      const { dx, dy } = scope.view;
      gctx.clearRect(0, 0, W, H);
      gctx.lineWidth = 1;
      gctx.strokeStyle = line;
      gctx.beginPath();
      for (let i = 0; i <= DIVS_X; i++) {
        const x = Math.round(i * dx) + 0.5;
        gctx.moveTo(x, 0);
        gctx.lineTo(x, H);
      }
      for (let j = 0; j <= DIVS_Y; j++) {
        const y = Math.round(j * dy) + 0.5;
        gctx.moveTo(0, y);
        gctx.lineTo(W, y);
      }
      const cx = Math.round(W / 2) + 0.5;
      const cy = Math.round(H / 2) + 0.5;
      for (let i = 0; i <= DIVS_X * 5; i++) {
        const x = Math.round((i * dx) / 5) + 0.5;
        gctx.moveTo(x, cy - 4);
        gctx.lineTo(x, cy + 4);
      }
      for (let j = 0; j <= DIVS_Y * 5; j++) {
        const y = Math.round((j * dy) / 5) + 0.5;
        gctx.moveTo(cx - 4, y);
        gctx.lineTo(cx + 4, y);
      }
      gctx.stroke();
    };

    const drawTraces = () => {
      const { dy } = scope.view;
      const cy = H / 2;
      const { fft, ch2 } = scope.params;

      if (fft) {
        // Spectrum of CH1: DFT of N samples across the screen.
        const N = 256;
        const bins = 64;
        const s = new Float32Array(N);
        for (let n = 0; n < N; n++) s[n] = scope.valueAt((n / N) * W);
        const mags = [];
        let max = 0.4;
        for (let k = 1; k <= bins; k++) {
          let re = 0;
          let im = 0;
          for (let n = 0; n < N; n++) {
            const ang = (2 * Math.PI * k * n) / N;
            re += s[n] * Math.cos(ang);
            im -= s[n] * Math.sin(ang);
          }
          const m = Math.hypot(re, im) / N;
          mags.push(m);
          if (m > max) max = m;
        }
        tctx.strokeStyle = CH1;
        tctx.lineWidth = 3;
        tctx.beginPath();
        mags.forEach((m, i) => {
          const x = ((i + 0.5) / bins) * W;
          tctx.moveTo(x, H - dy);
          tctx.lineTo(x, H - dy - (m / max) * dy * 5);
        });
        tctx.stroke();
        return;
      }

      tctx.lineJoin = "round";
      tctx.lineWidth = 2;
      if (ch2) {
        tctx.globalAlpha = 0.6;
        tctx.strokeStyle = CH2;
        tctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = cy - scope.ch2At(x) * dy;
          if (x === 0) tctx.moveTo(x, y);
          else tctx.lineTo(x, y);
        }
        tctx.stroke();
        tctx.globalAlpha = 1;
      }
      tctx.strokeStyle = CH1;
      tctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = cy - scope.valueAt(x) * dy;
        if (x === 0) tctx.moveTo(x, y);
        else tctx.lineTo(x, y);
      }
      tctx.stroke();
    };

    const updateHud = () => {
      const h = scope.hud;
      if (!h.run) return;
      const set = (el, text) => {
        if (el && el.textContent !== text) el.textContent = text;
      };
      set(h.run, scope.params.running ? "RUN" : "STOP");
      set(h.live, `f=${formatFreq(scope.smooth.freq)}  Vpp=${vpp(scope.smooth).toFixed(1)}V`);
    };

    // Strong in the hero, fainter further down the page.
    // On phones the text sits right on top of the scope, so it is much quieter there.
    const narrow = window.matchMedia("(max-width: 767px)");
    const fade = () => {
      const f = clamp(window.scrollY / (window.innerHeight * 0.7), 0, 1);
      const top = narrow.matches ? 0.28 : 1; // strength in the hero
      const low = narrow.matches ? 0.07 : 0.18; // strength further down the page
      wrap.style.opacity = String(top + (low - top) * f);
    };

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = scope.params;

      if (p.running) {
        scope.offset += dt * SCROLL_PX_PER_SEC;
        const tf = p.manual ? p.freq : 40 + scope.mouse.x * 200;
        const ta = p.manual ? p.amp : 0.5 + (1 - scope.mouse.y) * 1.8;
        const k = p.manual ? 0.12 : 0.06;
        scope.smooth.freq += (tf - scope.smooth.freq) * k;
        scope.smooth.amp += (ta - scope.smooth.amp) * k;
      }
      scope.spikes = scope.spikes.filter((s) => s.c - scope.offset > -60);

      // Phosphor persistence: fade the previous frame instead of clearing it.
      tctx.globalCompositeOperation = "destination-out";
      tctx.fillStyle = "rgba(0,0,0,0.22)";
      tctx.fillRect(0, 0, W, H);
      tctx.globalCompositeOperation = "source-over";

      drawTraces();
      updateHud();
      raf = requestAnimationFrame(frame);
    }

    const still = () => {
      tctx.clearRect(0, 0, W, H);
      drawTraces();
      updateHud();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      for (const c of [grid, trace]) {
        c.width = W * dpr;
        c.height = H * dpr;
        c.style.width = `${W}px`;
        c.style.height = `${H}px`;
      }
      for (const ctx of [gctx, tctx]) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scope.view = { W, H, dx: W / DIVS_X, dy: H / DIVS_Y };
      drawGrid();
      if (reduce) still();
    };

    const onMove = (e) => {
      scope.mouse.x = e.clientX / window.innerWidth;
      scope.mouse.y = e.clientY / window.innerHeight;
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    fade();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", fade, { passive: true });
    const unsub = scope.subscribe(() => reduce && still());
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", fade);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={wrapRef} className="scope-bg" aria-hidden="true">
      <canvas ref={gridRef} />
      <canvas ref={traceRef} />
    </div>
  );
};

export default ScopeBackground;
