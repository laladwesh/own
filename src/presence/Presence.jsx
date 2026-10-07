import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { daemon } from "../daemon/state";
import { BODY, Pixels } from "../daemon/Daemon";
import { getPresence, patchPresence, subscribePresence } from "./store";

const SIZE = 32;
const MAX_DRAWN = 8;
const SEND_MS = 100; // at most 10 positions a second

const media = (q) => window.matchMedia(q);

// A faint copy of the daemon for another visitor.
const PeerSprite = () => (
  <svg className="daemon-svg" viewBox="0 0 16 16" width={SIZE} height={SIZE}>
    <Pixels grid={BODY} cls={{ O: "dm-o", B: "dm-b", C: "dm-c" }} />
    <rect x="3" y="9" width="2" height="1" className="dm-c" />
    <rect x="11" y="9" width="2" height="1" className="dm-c" />
    <rect x="7" y="10" width="2" height="1" className="dm-o" />
    <rect x="4" y="6" width="2" height="2" className="dm-o" />
    <rect x="10" y="6" width="2" height="2" className="dm-o" />
  </svg>
);

// Other visitors. The socket loads after the page (a separate chunk) and, if it cannot connect,
// presence just stays off: nothing here is needed for the page to work.
//
// Desktop with a mouse: your pointer position is sent (0-1 of the viewport, 10 times a second at
// most, only while the tab is visible) and other daemons on the same page are drawn. Touch and
// reduced motion: you still count as online, but nothing is drawn and no positions are sent.
const Presence = () => {
  const { pathname } = useLocation();
  const { enabled } = useSyncExternalStore(subscribePresence, getPresence);
  const [drawn, setDrawn] = useState([]); // [{ id, name }]
  const socketRef = useRef(null);
  const pathRef = useRef(pathname);
  const enabledRef = useRef(enabled);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const peers = useRef(new Map()); // id -> { name, tx, ty, cx, cy, el }
  const activeRef = useRef(false);

  pathRef.current = pathname;
  enabledRef.current = enabled;

  // connect
  useEffect(() => {
    const fine = media("(pointer: fine) and (hover: hover)").matches;
    const calm = !media("(prefers-reduced-motion: reduce)").matches;
    const active = fine && calm;
    activeRef.current = active;

    let socket = null;
    let gone = false;
    let lastSent = 0;

    const pick = (list) => {
      // Nearest 8 to my pointer.
      const { x, y } = pointer.current;
      const nearest = [...list].sort((a, b) => (a.x - x) ** 2 + (a.y - y) ** 2 - ((b.x - x) ** 2 + (b.y - y) ** 2)).slice(0, MAX_DRAWN);
      const keep = new Set(nearest.map((p) => p.id));
      for (const id of peers.current.keys()) if (!keep.has(id)) peers.current.delete(id);
      for (const p of nearest) {
        const cur = peers.current.get(p.id);
        if (cur) {
          cur.tx = p.x;
          cur.ty = p.y;
        } else peers.current.set(p.id, { name: p.name, tx: p.x, ty: p.y, cx: p.x, cy: p.y, el: null });
      }
      setDrawn((prev) => {
        const same = prev.length === nearest.length && prev.every((d, i) => d.id === nearest[i].id);
        return same ? prev : nearest.map((p) => ({ id: p.id, name: p.name }));
      });
    };

    const onMove = (e) => {
      pointer.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      const now = performance.now();
      if (!socket?.connected || !active || !enabledRef.current || document.visibilityState !== "visible") return;
      if (now - lastSent < SEND_MS) return;
      lastSent = now;
      socket.volatile.emit("pos", { page: pathRef.current, x: pointer.current.x, y: pointer.current.y });
    };

    import("socket.io-client")
      .then(({ io }) => {
        if (gone) return;
        socket = io("/presence", {
          auth: { passive: !active },
          reconnectionAttempts: 3,
          timeout: 5000,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("page", { page: pathRef.current });
          socket.emit("presence", { on: enabledRef.current });
        });
        socket.on("hello", ({ id, name, online }) => patchPresence({ connected: true, you: { id, name }, online }));
        socket.on("online", (online) => patchPresence({ online }));
        socket.on("peers", (list) => {
          if (Array.isArray(list)) pick(list.filter((p) => p && typeof p.id === "string" && Number.isFinite(p.x) && Number.isFinite(p.y)));
        });
        const off = () => {
          patchPresence({ connected: false, you: null, online: { total: 0, pages: {} } });
          peers.current.clear();
          setDrawn([]);
        };
        socket.on("presence:off", () => {
          off();
          socket.close();
        });
        socket.on("disconnect", off);
        socket.on("connect_error", off);
      })
      .catch(() => {});

    if (active) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      gone = true;
      window.removeEventListener("pointermove", onMove);
      socket?.close();
      socketRef.current = null;
      peers.current.clear();
    };
  }, []);

  // which page I am on
  useEffect(() => {
    const s = socketRef.current;
    peers.current.clear();
    setDrawn([]);
    if (s?.connected) s.emit("page", { page: pathname });
  }, [pathname]);

  // hide or show myself
  useEffect(() => {
    const s = socketRef.current;
    if (s?.connected) s.emit("presence", { on: enabled });
  }, [enabled]);

  // Smooth motion between updates, and device colours when a daemon is over the terminal.
  useEffect(() => {
    if (!drawn.length) return undefined;
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.exp(-dt * 14);
      const term = document.querySelector(".term-window")?.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;
      for (const p of peers.current.values()) {
        p.cx += (p.tx - p.cx) * k;
        p.cy += (p.ty - p.cy) * k;
        if (!p.el) continue;
        const px = p.cx * W;
        const py = p.cy * H;
        p.el.style.transform = `translate3d(${px - SIZE / 2}px, ${py - SIZE / 2}px, 0)`;
        p.el.classList.toggle("dm-terminal", !!term && px >= term.left && px <= term.right && py >= term.top && py <= term.bottom);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [drawn]);

  if (!drawn.length) return null;

  return (
    <div className="peer-layer" aria-hidden="true" style={{ opacity: daemon.stopped ? 0 : 1 }}>
      {drawn.map((d) => (
        <div
          key={d.id}
          className="peer-daemon"
          ref={(el) => {
            const p = peers.current.get(d.id);
            if (p) p.el = el;
          }}
        >
          <PeerSprite />
          <span className="peer-name">{d.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Presence;
