import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { close, menu } from "../assets";
import { navLinks } from "../constants";
import { scrollToSection } from "../lib/helperFunctions";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
    if (pathname !== "/") return () => io.disconnect();
    navLinks.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  // A page of its own is active while you are on it (or on something inside it).
  const isActive = (n) => {
    if (n.to) {
      if (n.to === "/case-studies") return pathname === n.to || pathname.startsWith("/projects/");
      return pathname === n.to || pathname.startsWith(`${n.to}/`);
    }
    return pathname === "/" && active === n.id;
  };

  const linkCls = (n) => `nav-link${isActive(n) ? " nav-link--active" : ""}`;

  const go = (id) => {
    setToggle(false);
    // Most entries are pages of their own; about and contact are sections of the homepage.
    const page = navLinks.find((n) => n.id === id)?.to;
    if (page) {
      navigate(page);
      return;
    }
    // Off the homepage, go to that section on the homepage (/#section).
    if (pathname === "/") scrollToSection(id);
    else navigate({ pathname: "/", hash: `#${id}` });
  };

  return (
    <nav className={`nav-styles sm:px-16 px-6${scrolled ? " nav-styles--scrolled" : ""}`} aria-label="Sections">
      <Link to={{ pathname: "/", hash: "#home" }} className="nav-ctx" translate="no">
        ctx: avinash@prod
      </Link>

      <ul className="list-none lg:flex hidden items-center gap-5">
        {navLinks.map((n) => (
          <li key={n.id}>
            <button type="button" className={linkCls(n)} aria-current={isActive(n) ? "true" : undefined} onClick={() => go(n.id)}>
              {n.title}
            </button>
          </li>
        ))}
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
                <button type="button" className={linkCls(n)} aria-current={isActive(n) ? "true" : undefined} onClick={() => go(n.id)}>
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
