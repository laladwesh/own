import { useState, useEffect } from "react";
import { close, menu, avinash } from "../assets";
import { navLinks, resumeLink } from "../constants";
import { scrollToSection } from "../lib/helperFunctions";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillFilePdf } from "react-icons/ai";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowNavbar(y < lastScrollY || y < 120);
      setScrolled(y > 40);
      setLastScrollY(y);

      // active-section detection
      const ids = ["home", ...navLinks.map((n) => n.id)];
      let current = "home";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: showNavbar ? 0 : -110 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="nav-styles sm:px-10 px-5 py-3"
    >
      <div
        className={`mx-auto w-full max-w-[1280px] flex justify-between items-center rounded-2xl px-4 py-2 transition-all duration-300 ${
          scrolled
            ? "glass shadow-[0_10px_40px_-20px_rgba(124,58,237,0.6)]"
            : "bg-transparent border border-transparent"
        }`}
      >
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 group">
          <img
            src={avinash}
            alt="Avinash Gupta"
            className="w-[52px] h-[52px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
          />
        </a>

        {/* Desktop links */}
        <ul className="list-none md:flex hidden justify-end items-center gap-1">
          {navLinks.map((nav) => (
            <li key={nav.id} className="relative">
              <button
                onClick={() => scrollToSection(nav.id)}
                className={`font-poppins font-medium text-[13px] px-3 py-2 rounded-lg transition-colors duration-200 ${
                  active === nav.id
                    ? "text-white"
                    : "text-dimWhite hover:text-violet-200"
                }`}
              >
                {nav.title}
                {active === nav.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-lg bg-violet-500/15 border border-violet-400/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Resume CTA (desktop) */}
        <a
          href={resumeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="md:inline-flex hidden items-center gap-2 ml-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold font-poppins shine-hover shadow-[0_0_24px_-8px_rgba(168,85,247,0.6)] transition-colors"
        >
          <AiFillFilePdf /> Resume
        </a>

        {/* Mobile toggle */}
        <div className="md:hidden flex justify-end items-center">
          <button
            onClick={() => setToggle((p) => !p)}
            className="w-10 h-10 flex items-center justify-center rounded-xl glass"
            aria-label="Menu"
          >
            <img
              src={toggle ? close : menu}
              alt="menu"
              className="w-[20px] h-[20px] object-contain"
            />
          </button>

          <AnimatePresence>
            {toggle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-6 absolute top-20 right-0 mx-4 my-2 min-w-[220px]"
              >
                <ul className="list-none flex flex-col gap-1">
                  {navLinks.map((nav) => (
                    <li key={nav.id}>
                      <button
                        onClick={() => {
                          scrollToSection(nav.id);
                          setToggle(false);
                        }}
                        className={`w-full text-left font-poppins text-[15px] px-3 py-2 rounded-lg transition-colors ${
                          active === nav.id
                            ? "text-white bg-violet-500/15"
                            : "text-dimWhite hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {nav.title}
                      </button>
                    </li>
                  ))}
                  <a
                    href={resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[14px] font-semibold font-poppins transition-colors"
                  >
                    <AiFillFilePdf /> Resume
                  </a>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
