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

const Donut = ({ value, total, label }) => {
  const pct = total ? (value / total) * 100 : 0;
  const r = 50, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative w-[120px] h-[120px] flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1f1b2e" strokeWidth="9" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#a78bfa" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-poppins font-bold text-[24px] text-white leading-none">{value}</span>
        <span className="font-poppins text-[9px] text-gray-500 mt-1">{label}</span>
      </div>
    </div>
  );
};

const DiffBar = ({ label, solved, total, color }) => (
  <div className="mb-3 last:mb-0">
    <div className="flex justify-between mb-1">
      <span className="font-poppins text-[12px] font-medium" style={{ color }}>{label}</span>
      <span className="font-poppins text-[11px] text-gray-500">{solved} / {total ?? "…"}</span>
    </div>
    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${total ? (solved / total) * 100 : 0}%`, background: color }}
      />
    </div>
  </div>
);

const LeetCodeCard = ({ profile, solved, totals }) => (
  <div className="rounded-2xl p-5 bg-[#0d0b1a] h-full flex flex-col">
    <div className="flex items-center gap-2 mb-4">
      {profile?.avatar && (
        <img src={profile.avatar} alt="" className="w-8 h-8 rounded-full" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-poppins text-[13px] text-white font-semibold leading-none truncate">
          {profile?.username ?? "…"}
        </p>
        <p className="font-poppins text-[11px] text-gray-500 mt-1">
          Rank #{profile?.ranking ? profile.ranking.toLocaleString() : "…"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4 flex-1">
      <Donut value={solved?.solvedProblem ?? 0} total={totals.all} label="Solved" />
      <div className="flex-1 min-w-0">
        <DiffBar label="Easy"   solved={solved?.easySolved ?? 0}   total={totals.easy}   color="#00b8a3" />
        <DiffBar label="Medium" solved={solved?.mediumSolved ?? 0} total={totals.medium} color="#ffc01e" />
        <DiffBar label="Hard"   solved={solved?.hardSolved ?? 0}   total={totals.hard}   color="#ff375f" />
      </div>
    </div>
  </div>
);

const LeetCodeStats = () => {
  const [solved, setSolved]         = useState(null);
  const [profile, setProfile]       = useState(null);
  const [calData, setCalData]       = useState([]);
  const [activeDays, setActiveDays] = useState(null);
  const [maxStreak, setMaxStreak]   = useState(null);
  const [totals, setTotals]         = useState({ easy: null, medium: null, hard: null, all: null });
  const [tip, setTip]               = useState(null);
  const [tipPos, setTipPos]         = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`${API}/solved`)
      .then((r) => r.json())
      .then((d) => { if (d.solvedProblem !== undefined) setSolved(d); })
      .catch(() => {});

    Promise.all(
      ["EASY", "MEDIUM", "HARD"].map((diff) =>
        fetch(`https://alfa-leetcode-api.onrender.com/problems?difficulty=${diff}&limit=1`).then((r) => r.json()),
      ),
    )
      .then(([easy, medium, hard]) => {
        setTotals({
          easy: easy.totalQuestions ?? null,
          medium: medium.totalQuestions ?? null,
          hard: hard.totalQuestions ?? null,
          all: (easy.totalQuestions || 0) + (medium.totalQuestions || 0) + (hard.totalQuestions || 0),
        });
      })
      .catch(() => {});

    fetch(API)
      .then((r) => r.json())
      .then((d) => { if (d.username) setProfile(d); })
      .catch(() => {});

    fetch(`${API}/calendar`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
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
          <LeetCodeCard profile={profile} solved={solved} totals={totals} />
        </motion.div>

        {/* Heatmap */}
        {calData.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="w-full lg:w-fit flex-shrink-0 rounded-2xl bg-[#0d0b1a] border border-gray-800 hover:border-purple-700 transition-colors duration-300 p-4"
          >
            <p className="font-poppins text-[11px] text-gray-500 mb-3 whitespace-nowrap">
              Submission Heatmap · Last 12 months{activeDays ? ` · ${activeDays} active days` : ""}
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
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
              </div>
            </div>
          </motion.div>
        )}

        {/* 3 stat cards — vertical on desktop, horizontal grid on mobile */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 flex-shrink-0 w-full lg:w-[150px]">
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
