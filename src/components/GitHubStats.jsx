import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";

const USERNAME = "laladwesh";
const TOKEN = import.meta.env.VITE_GH_TOKEN;
const authHeaders = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

// 1. Shared Tooltip Component
const Tooltip = ({ x, y, children }) => {
  return createPortal(
    <div
      style={{
        position: "fixed",
        left: x + 12,
        top: y - 36,
        background: "#1a1530",
        border: "1px solid #4c1d95",
        borderRadius: "6px",
        color: "#e9d5ff",
        fontSize: "11px",
        padding: "6px 12px",
        zIndex: 9999,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        fontFamily: "Poppins, sans-serif",
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      {children}
    </div>,
    document.body
  );
};

// 2. Minimal Loading Skeleton
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#1a1530] rounded-md ${className}`} />
);

// 3. Stat Card
const StatCard = ({ label, value, delay = 0 }) => (
  <motion.div
    initial={{ y: 10, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay }}
    className="flex flex-col items-start justify-center p-5 rounded-xl bg-[#0d0b1a] border border-[#1f1b2e] hover:border-purple-900/60 transition-colors duration-300 w-full h-full"
  >
    <div className="font-poppins text-[11px] text-gray-400 font-medium tracking-wider uppercase mb-1.5">
      {label}
    </div>
    <div className="font-poppins font-semibold text-[26px] text-white leading-none">
      {value !== null ? value.toLocaleString() : <Skeleton className="h-7 w-16" />}
    </div>
  </motion.div>
);

// 4. Panel Container
const Panel = ({ title, children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ y: 10, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35, delay }}
    className={`relative overflow-hidden rounded-xl p-5 bg-[#0d0b1a] border border-[#1f1b2e] flex flex-col h-full w-full ${className}`}
  >
    {title && (
      <h3 className="font-poppins text-[12px] font-semibold text-gray-400 mb-4 tracking-wide uppercase">
        {title}
      </h3>
    )}
    <div className="flex-1 flex flex-col justify-center">{children}</div>
  </motion.div>
);

// 5. Streaks Component
const StreakStats = ({ total, current, longest }) => (
  <Panel title="Contribution Streak">
    <div className="flex flex-row items-center justify-between flex-1 py-2">
      <div className="flex flex-col items-start">
        <div className="font-poppins font-semibold text-[28px] text-white leading-none mb-1">
          {total !== null ? total.toLocaleString() : <Skeleton className="h-8 w-12" />}
        </div>
        <div className="font-poppins text-[11px] text-gray-500 font-medium uppercase tracking-wide">Total</div>
      </div>
      
      <div className="w-px h-10 bg-[#1f1b2e] mx-3" />
      
      <div className="flex flex-col items-start">
        <div className="font-poppins font-semibold text-[28px] text-[#a78bfa] leading-none mb-1">
          {current !== null ? current : <Skeleton className="h-8 w-10" />}
        </div>
        <div className="font-poppins text-[11px] text-gray-500 font-medium uppercase tracking-wide">Current</div>
      </div>

      <div className="w-px h-10 bg-[#1f1b2e] mx-3" />
      
      <div className="flex flex-col items-start">
        <div className="font-poppins font-semibold text-[28px] text-white leading-none mb-1">
          {longest !== null ? longest : <Skeleton className="h-8 w-10" />}
        </div>
        <div className="font-poppins text-[11px] text-gray-500 font-medium uppercase tracking-wide">Longest</div>
      </div>
    </div>
  </Panel>
);

// 6. Interactive Line Graph with Tooltip
const ActivityLineGraph = ({ weeks }) => {
  const [hoverData, setHoverData] = useState(null);
  const containerRef = useRef(null);

  if (!weeks || weeks.length < 2) return <Skeleton className="w-full h-full min-h-[140px]" />;
  
  // Flatten data to calculate totals per week
  const weeklyTotals = weeks.map((w) => w.contributionDays.reduce((s, d) => s + d.contributionCount, 0));
  
  const W = 600, H = 140, pad = 6;
  const max = Math.max(...weeklyTotals, 1);
  const stepX = (W - pad * 2) / (weeklyTotals.length - 1);
  
  const points = weeklyTotals.map((v, i) => ({
    x: pad + i * stepX,
    y: H - pad - (v / max) * (H - pad * 2),
    value: v,
    date: weeks[i].contributionDays[0].date // Start of the week
  }));
  
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Find the closest point based on mouse X position
    const hoverX = (x / rect.width) * W;
    const closestPoint = points.reduce((prev, curr) => 
      Math.abs(curr.x - hoverX) < Math.abs(prev.x - hoverX) ? curr : prev
    );

    setHoverData({
      ...closestPoint,
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  };

  return (
    <div 
      className="w-full h-full min-h-[120px] flex flex-col justify-end relative cursor-crosshair"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverData(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible absolute inset-0" preserveAspectRatio="none">
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          d={linePath} 
          fill="none" 
          stroke="#a78bfa" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke" 
        />
        {/* Render indicator on hovered point */}
        {hoverData && (
          <circle 
            cx={hoverData.x} 
            cy={hoverData.y} 
            r="4" 
            fill="#0d0b1a" 
            stroke="#e9d5ff" 
            strokeWidth="2" 
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      
      {hoverData && (
        <Tooltip x={hoverData.mouseX} y={hoverData.mouseY}>
          <span className="font-semibold text-white">{hoverData.value} commits</span>
          <span className="text-gray-400 ml-2">
            week of {new Date(hoverData.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

// 7. Language Ring
const LanguageRing = ({ languages }) => {
  if (languages.length === 0) return <Skeleton className="w-[120px] h-[120px] rounded-full mx-auto" />;
  
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  const segments = languages.map((l) => {
    const len = (l.pct / 100) * c;
    const seg = { ...l, len, offset };
    offset += len;
    return seg;
  });

  return (
    <div className="flex flex-row items-center justify-between w-full h-full px-2">
      <div className="relative w-[110px] h-[110px] flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1a1530" strokeWidth="14" />
          {segments.map((s) => (
            <motion.circle
              key={s.name}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: -s.offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              cx="60" cy="60" r={r} fill="none"
              stroke={s.color || "#a78bfa"}
              strokeWidth="14"
              strokeDasharray={`${s.len} ${c - s.len}`}
            />
          ))}
        </svg>
      </div>
      
      <div className="flex flex-col gap-2.5 w-full pl-6">
        {languages.slice(0, 4).map((l) => (
          <div key={l.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color || "#a78bfa" }} />
              <span className="font-poppins text-[12px] text-gray-300">{l.name}</span>
            </div>
            <span className="font-poppins text-[12px] text-gray-500">{l.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeatmapLegend = () => {
  const swatches = ["#1a1530", "#2e1065", "#4c1d95", "#6d28d9", "#a78bfa"];
  return (
    <div className="flex items-center gap-2 mt-3 justify-end w-full">
      <span className="font-poppins text-[10px] text-gray-500 uppercase tracking-widest">Less</span>
      <div className="flex gap-1.5">
        {swatches.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-[2px]" style={{ background: c }} />
        ))}
      </div>
      <span className="font-poppins text-[10px] text-gray-500 uppercase tracking-widest">More</span>
    </div>
  );
};

// Main Component
const GitHubStats = () => {
  const [stats, setStats] = useState({
    repos: null, followers: null, prs: null, issues: null, commits: null, stars: null, totalContributions: null,
  });
  const [calendarWeeks, setCalendarWeeks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tip, setTip] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });

  // Explicitly updated to requested URL
  const CODING_GIF_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1kHEgewyUp-ttr19nwwZ7nUUfCEwfYsJE3w&s";

  useEffect(() => {
    fetch(`https://api.github.com/users/${USERNAME}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.login) setStats((p) => ({ ...p, repos: d.public_repos, followers: d.followers }));
      }).catch(() => {});

    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`, { headers: authHeaders })
      .then((r) => r.json())
      .then((repos) => {
        if (Array.isArray(repos)) {
          const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
          setStats((p) => ({ ...p, stars }));
        }
      }).catch(() => {});

    if (TOKEN) {
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ user(login: "${USERNAME}") {
            contributionsCollection {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
            }
            repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
              nodes { languages(first: 6, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
            }
          } }`,
        }),
      })
        .then((r) => r.json())
        .then(({ data }) => {
          const c = data?.user?.contributionsCollection;
          if (c) {
            setStats((p) => ({
              ...p,
              commits: c.totalCommitContributions,
              issues: c.totalIssueContributions,
              prs: c.totalPullRequestContributions,
              totalContributions: c.contributionCalendar?.totalContributions ?? null,
            }));
            setCalendarWeeks(c.contributionCalendar?.weeks ?? []);
          }

          const repos = data?.user?.repositories?.nodes;
          if (Array.isArray(repos)) {
            const totals = {};
            const colors = {};
            repos.forEach((r) => {
              r.languages?.edges?.forEach(({ size, node }) => {
                totals[node.name] = (totals[node.name] || 0) + size;
                colors[node.name] = node.color;
              });
            });
            const sum = Object.values(totals).reduce((a, b) => a + b, 0);
            const top = Object.entries(totals)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, size]) => ({
                name, pct: sum ? (size / sum) * 100 : 0, color: colors[name],
              }));
            setLanguages(top);
          }
        }).catch(() => {});
    }
  }, []);

  const { currentStreak, longestStreak } = useMemo(() => {
    const days = calendarWeeks.flatMap((w) => w.contributionDays);
    if (days.length === 0) return { currentStreak: null, longestStreak: null };

    let i = days.length - 1;
    if (days[i].contributionCount === 0) i--;
    let current = 0;
    for (; i >= 0; i--) {
      if (days[i].contributionCount > 0) current++;
      else break;
    }

    let longest = 0, run = 0;
    for (const d of days) {
      if (d.contributionCount > 0) { run++; longest = Math.max(longest, run); }
      else run = 0;
    }

    return { currentStreak: current, longestStreak: longest };
  }, [calendarWeeks]);

  const statItems = [
    { label: "Public Repos", value: stats.repos },
    { label: "Stars Earned", value: stats.stars },
    { label: "Commits (YTD)", value: stats.commits },
    { label: "Pull Requests", value: stats.prs },
    { label: "Issues Opened", value: stats.issues },
    { label: "Followers", value: stats.followers },
  ];

  return (
    <section id="githubStats" className="mb-20 max-w-[1200px] mx-auto px-4 font-poppins">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h1 className="text-[32px] sm:text-[38px] font-semibold text-white leading-tight">
          GitHub Architecture
        </h1>
        <p className="text-gray-400 mt-1 text-[14px]">Systematic breakdown of open-source metrics.</p>
      </motion.div>

      {/* Main Grid Wrapper - strict gap-4 prevents ALL weird vertical spacing */}
      <div className="flex flex-col gap-4">
        
        {/* Row 1: Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statItems.map((s, i) => (
            <StatCard key={s.label} label={s.label} value={s.value} delay={i * 0.05} />
          ))}
        </div>

        {/* Row 2: Streaks & Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[220px]">
          <div className="lg:col-span-5 h-full">
            <StreakStats total={stats.totalContributions} current={currentStreak} longest={longestStreak} />
          </div>
          <div className="lg:col-span-7 h-full">
            <Panel title="Activity Overview (Last 12 Months)" delay={0.1}>
              {/* Passes calendarWeeks directly so we can grab dates for the tooltip */}
              <ActivityLineGraph weeks={calendarWeeks} />
            </Panel>
          </div>
        </div>

        {/* Row 3: Languages, Calendar, and GIF */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[240px]">
          
          <div className="lg:col-span-4 h-full">
            <Panel title="Language Distribution" delay={0.15}>
              <LanguageRing languages={languages} />
            </Panel>
          </div>

          <div className="lg:col-span-6 h-full">
            <Panel title="Contribution Heatmap" delay={0.2} className="relative">
              <div className="w-full flex-1 flex flex-col justify-center overflow-hidden"> 
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <div className="min-w-[650px] inline-block">
                    <GitHubCalendar
                      username={USERNAME}
                      colorScheme="dark"
                      theme={{ dark: ["#1a1530", "#2e1065", "#4c1d95", "#6d28d9", "#a78bfa"] }}
                      style={{ color: "#9ca3af" }}
                      blockSize={12}
                      blockMargin={4}
                      fontSize={12}
                      hideTotalCount
                      hideColorLegend
                      renderBlock={(block, activity) =>
                        React.cloneElement(block, {
                          onMouseEnter: (e) => { setTip(activity); setTipPos({ x: e.clientX, y: e.clientY }); },
                          onMouseMove: (e) => setTipPos({ x: e.clientX, y: e.clientY }),
                          onMouseLeave: () => setTip(null),
                          className: "hover:ring-1 hover:ring-white transition-all duration-100 rounded-[2px]",
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <HeatmapLegend />
            </Panel>
          </div>

          <div className="lg:col-span-2 hidden lg:block h-full">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="h-full w-full p-1.5 rounded-xl bg-[#0d0b1a] border border-[#1f1b2e] overflow-hidden group"
            >
               <img 
                 src={CODING_GIF_URL} 
                 alt="Coding Animation" 
                 className="w-full h-full object-cover rounded-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"
               />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Heatmap Tooltip */}
      {tip && (
        <Tooltip x={tipPos.x} y={tipPos.y}>
          <span className="font-semibold text-white">
            {tip.count} contribution{tip.count !== 1 ? "s" : ""}
          </span>
          <span className="text-gray-400 ml-2">
            on {new Date(tip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </Tooltip>
      )}
    </section>
  );
};

export default GitHubStats;