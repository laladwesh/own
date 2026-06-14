import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ActivityCalendar } from "react-activity-calendar";

const LC_USERNAME = "ibXDVQOY8i";
const API = `https://alfa-leetcode-api.onrender.com/${LC_USERNAME}`;

const buildCalendarResult = (raw) => {
  let submissionMap = {};
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    Object.entries(obj).forEach(([ts, count]) => {
      const dateStr = new Date(parseInt(ts, 10) * 1000).toISOString().split("T")[0];
      submissionMap[dateStr] = (submissionMap[dateStr] || 0) + Number(count);
    });
  } catch (_) {}

  // Build contiguous 365-day array (ActivityCalendar requires no gaps)
  const today = new Date();
  const start = new Date(today);
  start.setFullYear(today.getFullYear() - 1);
  start.setDate(start.getDate() + 1);

  const data = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const count = submissionMap[dateStr] || 0;
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
    data.push({ date: dateStr, count, level });
  }

  // Max streak — simple sequential scan over the filled array (no date arithmetic)
  let maxStreak = 0;
  let cur = 0;
  for (const { count } of data) {
    if (count > 0) { cur++; if (cur > maxStreak) maxStreak = cur; }
    else cur = 0;
  }

  return { data, maxStreak };
};

const StatCard = ({ label, value, delay = 0 }) => (
  <motion.div
    initial={{ y: 14, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35, delay }}
    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-[#0d0b1a] border border-gray-800 hover:border-purple-700 hover:shadow-[0_0_14px_rgba(139,92,246,0.1)] transition-all duration-300"
  >
    <span className="font-poppins font-bold text-[17px] text-gradient leading-none">
      {value ?? "…"}
    </span>
    <span className="font-poppins text-[10px] text-gray-500 mt-1.5 text-center leading-tight">
      {label}
    </span>
  </motion.div>
);

const LeetCodeStats = () => {
  const [solved, setSolved]         = useState(null);
  const [profile, setProfile]       = useState(null);
  const [calData, setCalData]       = useState([]);
  const [activeDays, setActiveDays] = useState(null);
  const [maxStreak, setMaxStreak]   = useState(null);
  const [tip, setTip]               = useState(null);
  const [tipPos, setTipPos]         = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`${API}/solved`)
      .then((r) => r.json())
      .then((d) => { if (d.solvedProblem !== undefined) setSolved(d); })
      .catch(() => {});

    fetch(API)
      .then((r) => r.json())
      .then((d) => { if (d.username) setProfile(d); })
      .catch(() => {});

    fetch(`${API}/calendar`)
      .then((r) => r.json())
      .then((d) => {
        // Set streak immediately — before any processing that could throw
        const streakNum = Number(d.streak) || 0;
        if (streakNum > 0) setMaxStreak(streakNum);

        if (!d.submissionCalendar) return;
        const { data, maxStreak: ms } = buildCalendarResult(d.submissionCalendar);
        setCalData(data);
        setActiveDays(d.totalActiveDays ?? null);
        // Upgrade to computed if larger
        if (ms > streakNum) setMaxStreak(ms);
      })
      .catch(() => {});
  }, []);

  const statItems = [
    { label: "Active Days",  value: activeDays ?? null },
    { label: "Global Rank",  value: profile?.ranking ? profile.ranking.toLocaleString() : null },
    { label: "Max Streak ", value: maxStreak !== null ? `${maxStreak}d` : null },
  ];

  const lcCardUrl = `https://leetcard.jacoblin.cool/${LC_USERNAME}?theme=dark&font=Baloo+2&border=0&radius=12&background=0d0b1a`;

  return (
    <section id="leetcodeStats" className="mb-16">
      <h1 className="font-poppins font-semibold ss:text-[55px] text-[45px] text-white ss:leading-[80px] leading-[80px] mb-5">
        LeetCode Stats
      </h1>

      {/* Single row: LeetCard | Heatmap | 3 stat cards vertical */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* LeetCard */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[340px] flex-shrink-0 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-700 transition-colors duration-300 bg-[#0d0b1a]"
        >
          <img src={lcCardUrl} alt="LeetCode Card" className="w-full h-full object-contain" loading="lazy" />
        </motion.div>

        {/* Heatmap */}
        {calData.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="w-full lg:w-fit flex-shrink-0 rounded-2xl bg-[#0d0b1a] border border-gray-800 hover:border-purple-700 transition-colors duration-300 overflow-x-auto p-4"
          >
            <p className="font-poppins text-[11px] text-gray-500 mb-3 whitespace-nowrap">
              Submission Heatmap · Last 12 months{activeDays ? ` · ${activeDays} active days` : ""}
            </p>
            <ActivityCalendar
              data={calData}
              colorScheme="dark"
              theme={{ dark: ["#1a1530", "#2e1065", "#4c1d95", "#6d28d9", "#a78bfa"] }}
              style={{ color: "#9ca3af" }}
              blockSize={10}
              blockMargin={3}
              fontSize={10}
              renderBlock={(block, activity) =>
                React.cloneElement(block, {
                  onMouseEnter: (e) => { setTip(activity); setTipPos({ x: e.clientX, y: e.clientY }); },
                  onMouseMove:  (e) => setTipPos({ x: e.clientX, y: e.clientY }),
                  onMouseLeave: ()  => setTip(null),
                  style: { cursor: "pointer" },
                })
              }
            />
          </motion.div>
        )}

        {/* 3 stat cards — vertical stack beside heatmap */}
        <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0 w-full lg:w-[150px]">
          {statItems.map((s, i) => (
            <StatCard key={s.label} label={s.label} value={s.value} delay={i * 0.05} />
          ))}
        </div>
      </div>

      {/* Portal tooltip */}
      {tip && createPortal(
        <div style={{
          position: "fixed",
          left: tipPos.x + 14,
          top:  tipPos.y - 48,
          background: "#1a1530",
          border: "1px solid #4c1d95",
          borderRadius: "8px",
          color: "#e9d5ff",
          fontSize: "12px",
          padding: "6px 10px",
          zIndex: 9999,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          fontFamily: "Poppins, sans-serif",
          lineHeight: "1.6",
        }}>
          <b>{tip.count} submission{tip.count !== 1 ? "s" : ""}</b>
          <br />
          {(() => {
            const d = new Date(tip.date);
            return `${d.getDate()} ${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
          })()}
        </div>,
        document.body
      )}
    </section>
  );
};

export default LeetCodeStats;
