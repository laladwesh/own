import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const PREVIEW_W = 280;
const PREVIEW_H = 210;
const OFFSET = 18;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const getPos = (e) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = e.clientX + OFFSET;
  let y = e.clientY + OFFSET;
  if (x + PREVIEW_W > vw - 8) x = e.clientX - PREVIEW_W - OFFSET;
  if (y + PREVIEW_H > vh - 8) y = e.clientY - PREVIEW_H - OFFSET;
  return { x: clamp(x, 8, vw - PREVIEW_W - 8), y: clamp(y, 8, vh - PREVIEW_H - 8) };
};

const getDomain = (url) => {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
};

export const LinkPreview = ({ children, url, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [imgErr, setImgErr] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;

  // Preload screenshot on mount so hover shows it instantly
  useEffect(() => {
    const img = new Image();
    img.src = screenshotUrl;
  }, [screenshotUrl]);

  const handleMouseEnter = (e) => {
    if (isMobile) return;
    setImgErr(false);
    setPos(getPos(e));
    setIsOpen(true);
  };

  const handleMouseMove = (e) => {
    if (isOpen) setPos(getPos(e));
  };

  const handleMouseLeave = () => setIsOpen(false);

  return (
    <>
      <span
        style={{ display: "inline-block" }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </span>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 6 }}
                transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.7 }}
                style={{
                  position: "fixed",
                  left: pos.x,
                  top: pos.y,
                  width: PREVIEW_W,
                  zIndex: 9999,
                  pointerEvents: "none",
                }}
              >
                <div className="rounded-xl overflow-hidden border border-purple-700 shadow-2xl shadow-purple-900/50 bg-[#0d0b1a]">
                  {/* Screenshot */}
                  <div className="relative w-full h-[155px] bg-[#1a1530] overflow-hidden">
                    {!imgErr ? (
                      <img
                        src={screenshotUrl}
                        alt="site preview"
                        className="w-full h-full object-cover object-top"
                        onError={() => setImgErr(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-poppins">
                        Preview unavailable
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b1a] via-transparent to-transparent" />
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 flex items-center gap-2">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=16`}
                      alt=""
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      onError={(e) => e.target.style.display = "none"}
                    />
                    <span className="text-xs text-purple-300 font-poppins truncate">{getDomain(url)}</span>
                    <span className="ml-auto text-[10px] text-gray-600 font-poppins flex-shrink-0">click to open →</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
