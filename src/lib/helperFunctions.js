// One consistent page scroll: 600ms, ease-out-cubic. Instant with reduced motion, and it
// gives way as soon as the reader scrolls by hand.
let frame = 0;

const cancelOnInput = () => {
  cancelAnimationFrame(frame);
  window.removeEventListener("wheel", cancelOnInput);
  window.removeEventListener("touchstart", cancelOnInput);
};

export const smoothScrollTo = (top, ms = 600) => {
  cancelAnimationFrame(frame);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, top);
    return;
  }
  const from = window.scrollY;
  const delta = top - from;
  const t0 = performance.now();
  window.addEventListener("wheel", cancelOnInput, { passive: true, once: true });
  window.addEventListener("touchstart", cancelOnInput, { passive: true, once: true });
  const step = (now) => {
    const t = Math.min((now - t0) / ms, 1);
    const eased = 1 - (1 - t) ** 3;
    window.scrollTo(0, from + delta * eased);
    if (t < 1) frame = requestAnimationFrame(step);
    else cancelOnInput();
  };
  frame = requestAnimationFrame(step);
};

// Smooth-scroll to a section below the fixed navbar.
export const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (!element) return;
  const yOffset = -70;
  smoothScrollTo(element.getBoundingClientRect().top + window.scrollY + yOffset);
};
