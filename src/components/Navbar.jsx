import { useEffect, useRef, useState } from "react";
import { close, menu } from "../assets";
import { navLinks } from "../constants";
import { scrollToSection } from "../lib/helperFunctions";

const PRIMARY = navLinks.filter((n) => n.primary);
const MORE = navLinks.filter((n) => !n.primary);

const Navbar = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const moreRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The section crossing the middle of the viewport is the active nav item.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navLinks.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const linkCls = (id) =>
    `nav-link${active === id ? " nav-link--active" : ""}`;

  const go = (id) => {
    setMoreOpen(false);
    setToggle(false);
    scrollToSection(id);
  };

  return (
    <nav className={`nav-styles sm:px-16 px-6${scrolled ? " nav-styles--scrolled" : ""}`} aria-label="Sections">
      <a href="#home" className="nav-ctx" translate="no">
        ctx: avinash@prod
      </a>

      <ul className="list-none lg:flex hidden items-center gap-5">
        {PRIMARY.map((n) => (
          <li key={n.id}>
            <button type="button" className={linkCls(n.id)} aria-current={active === n.id ? "true" : undefined} onClick={() => go(n.id)}>
              {n.title}
            </button>
          </li>
        ))}
        <li className="relative" ref={moreRef}>
          <button type="button" className="nav-link" aria-expanded={moreOpen} onClick={() => setMoreOpen((o) => !o)}>
            More
          </button>
          {moreOpen && (
            <ul className="nav-more">
              {MORE.map((n) => (
                <li key={n.id}>
                  <button type="button" className={`${linkCls(n.id)} nav-more-item`} onClick={() => go(n.id)}>
                    {n.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>

      <div className="lg:hidden flex items-center">
        <button
          type="button"
          aria-label={toggle ? "Close menu" : "Open menu"}
          aria-expanded={toggle}
          onClick={() => setToggle((t) => !t)}
        >
          <img src={toggle ? close : menu} alt="" width={28} height={28} className="w-[28px] h-[28px] object-contain" />
        </button>
        {toggle && (
          <ul className="nav-mobile sidebar">
            {navLinks.map((n) => (
              <li key={n.id}>
                <button type="button" className={linkCls(n.id)} onClick={() => go(n.id)}>
                  {n.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
