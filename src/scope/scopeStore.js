// Shared state for the oscilloscope background. The canvas loop, the HUD and the
// terminal `scope` command all use this object; nothing here touches React.

export const TIME_PER_DIV_MS = 5; // HUD reads 5.00ms/div
export const DIVS_X = 10;
export const DIVS_Y = 8;
export const CH1_VOLTS_PER_DIV = 2;
export const SCROLL_PX_PER_SEC = 80;

export const WAVES = ["sine", "square", "triangle", "sawtooth"];

const DEFAULTS = {
  freq: 120, // Hz
  amp: 1.2, // divisions
  wave: "sine",
  ch2: true,
  running: true,
  fft: false,
  manual: false, // true once freq/amp were set by a command (the mouse stops steering)
};

const waveFn = (type, u) => {
  const frac = u - Math.floor(u);
  switch (type) {
    case "square":
      return frac < 0.5 ? 1 : -1;
    case "triangle":
      return 4 * Math.abs(frac - 0.5) - 1;
    case "sawtooth":
      return 2 * frac - 1;
    default:
      return Math.sin(2 * Math.PI * u);
  }
};

export const vpp = (p) => 2 * p.amp * CH1_VOLTS_PER_DIV;

export const formatFreq = (hz) => (hz >= 1000 ? `${(hz / 1000).toFixed(2)}kHz` : `${Math.round(hz)}Hz`);

export const scope = {
  params: { ...DEFAULTS },
  smooth: { freq: DEFAULTS.freq, amp: DEFAULTS.amp }, // what is actually drawn
  mouse: { x: 0.5, y: 0.5 }, // 0..1 across the viewport
  spikes: [],
  offset: 0, // how far the pattern has scrolled, in px
  view: { W: 1440, H: 900, dx: 144, dy: 112.5 },
  hud: {},
  listeners: new Set(),

  set(patch) {
    const next = { ...patch };
    if ("freq" in next || "amp" in next) next.manual = true;
    const from = { ...this.params };
    Object.assign(this.params, next);
    this.listeners.forEach((l) => l(from, this.params));
  },

  reset() {
    const from = { ...this.params };
    this.params = { ...DEFAULTS };
    this.spikes = [];
    this.listeners.forEach((l) => l(from, this.params));
  },

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  // A sharp biphasic glitch entering at the right-hand side of CH1.
  spike() {
    const sign = Math.random() < 0.5 ? -1 : 1;
    this.spikes.push({ c: this.offset + this.view.W * 0.92, mag: sign * (1.2 + Math.random() * 1.2) });
    if (this.spikes.length > 24) this.spikes.shift();
  },

  cycles() {
    return this.smooth.freq * ((DIVS_X * TIME_PER_DIV_MS) / 1000);
  },

  // CH1 value in divisions at screen x (includes any spikes passing by).
  valueAt(x) {
    const u = this.cycles() * ((x + this.offset) / this.view.W);
    let v = this.smooth.amp * waveFn(this.params.wave, u);
    for (const s of this.spikes) {
      const d = x - (s.c - this.offset);
      if (d > -40 && d < 40) {
        v += s.mag * (Math.exp(-((d / 4) ** 2)) - 0.55 * Math.exp(-(((d - 9) / 6) ** 2)));
      }
    }
    return v;
  },

  ch2At(x) {
    const u = this.cycles() * 0.5 * ((x + this.offset) / this.view.W) + 0.25;
    return this.smooth.amp * 0.6 * Math.sin(2 * Math.PI * u);
  },
};
