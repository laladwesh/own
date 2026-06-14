import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";

const USERNAME = "laladwesh";
const TOKEN = import.meta.env.VITE_GH_TOKEN;
const authHeaders = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

const StatCard = ({ label, value, delay = 0 }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="flex flex-col items-center justify-center py-5 px-3 rounded-2xl bg-[#0d0b1a] border border-gray-800 hover:border-purple-700 hover:shadow-[0_0_24px_rgba(139,92,246,0.12)] transition-all duration-300"
  >
    <span className="font-poppins font-bold text-[26px] text-gradient leading-none">
      {value !== null ? value.toLocaleString() : "…"}
    </span>
    <span className="font-poppins text-[11px] text-gray-500 mt-2 text-center leading-tight">
      {label}
    </span>
  </motion.div>
);

const EmbedCard = ({ src, alt, delay = 0 }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay }}
    className="rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-700 transition-colors duration-300 bg-[#0d0b1a]"
  >
    <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
  </motion.div>
);

const GitHubStats = () => {
  const [stats, setStats] = useState({
    repos: null,
    followers: null,
    prs: null,
    commits: null,
    contributed: null,
    stars: null,
  });
  const [tip, setTip] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`https://api.github.com/users/${USERNAME}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.login)
          setStats((p) => ({
            ...p,
            repos: d.public_repos,
            followers: d.followers,
          }));
      })
      .catch(() => {});

    fetch(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr`, {
      headers: authHeaders,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.total_count !== undefined)
          setStats((p) => ({ ...p, prs: d.total_count }));
      })
      .catch(() => {});

    fetch(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`,
      { headers: authHeaders },
    )
      .then((r) => r.json())
      .then((repos) => {
        if (Array.isArray(repos)) {
          const stars = repos.reduce(
            (s, r) => s + (r.stargazers_count || 0),
            0,
          );
          setStats((p) => ({ ...p, stars }));
        }
      })
      .catch(() => {});

    if (TOKEN) {
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ user(login: "${USERNAME}") { contributionsCollection {
            totalCommitContributions totalRepositoriesWithContributedCommits
          } } }`,
        }),
      })
        .then((r) => r.json())
        .then(({ data }) => {
          const c = data?.user?.contributionsCollection;
          if (c)
            setStats((p) => ({
              ...p,
              commits: c.totalCommitContributions,
              contributed: c.totalRepositoriesWithContributedCommits,
            }));
        })
        .catch(() => {});
    }
  }, []);

  const statItems = [
    { label: "Public Repos", value: stats.repos },
    { label: "Pull Requests", value: stats.prs },
    { label: "Commits This Year", value: stats.commits },
    { label: "Stars Earned", value: stats.stars },
    { label: "Followers", value: stats.followers },
    { label: "Repos Contributed", value: stats.contributed },
  ];

  const bg = "0d0b1a";
  const streakUrl = `https://streak-stats.demolab.com/?user=${USERNAME}&background=${bg}&stroke=1f1b2e&ring=7c3aed&fire=a78bfa&currStreakNum=d8b4fe&sideNums=d8b4fe&currStreakLabel=d8b4fe&sideLabels=a78bfa&dates=6b7280&hide_border=true`;
  const topLangsUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${USERNAME}&layout=compact&langs_count=8&bg_color=${bg}&text_color=d8b4fe&title_color=d8b4fe&hide_border=true&border_radius=12`;
  const activityGraphUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${USERNAME}&bg_color=${bg}&color=d8b4fe&line=7c3aed&point=a78bfa&area=true&area_color=4c1d95&hide_border=true&radius=6`;

  return (
    <section id="githubStats" className="mb-16">
      <h1 className="font-poppins font-semibold ss:text-[55px] text-[45px] text-white ss:leading-[80px] leading-[80px] mb-8">
        GitHub Stats
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {statItems.map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            delay={i * 0.06}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <EmbedCard src={streakUrl} alt="GitHub Streak" delay={0} />
        <EmbedCard src={topLangsUrl} alt="Top Languages" delay={0.08} />
      </div>

      <EmbedCard
        src={activityGraphUrl}
        alt="GitHub Activity Graph"
        delay={0.1}
      />

      {/* Contribution heatmap — card shrinks to calendar width, custom portal tooltip */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mt-4 overflow-x-auto"
      >
        {/* inline-block without min-w-full so card is exactly as wide as the calendar */}
        <div className="inline-block rounded-2xl p-6 bg-[#0d0b1a] border border-gray-800 hover:border-purple-700 transition-colors duration-300">
          <p className="font-poppins text-[13px] text-gray-500 mb-5">
            Contribution Heatmap · Last 12 months
          </p>
          <GitHubCalendar
            username={USERNAME}
            colorScheme="dark"
            theme={{
              dark: ["#1a1530", "#2e1065", "#4c1d95", "#6d28d9", "#a78bfa"],
            }}
            style={{ color: "#9ca3af" }}
            blockSize={13}
            blockMargin={4}
            fontSize={12}
            renderBlock={(block, activity) =>
              React.cloneElement(block, {
                onMouseEnter: (e) => {
                  setTip(activity);
                  setTipPos({ x: e.clientX, y: e.clientY });
                },
                onMouseMove: (e) => setTipPos({ x: e.clientX, y: e.clientY }),
                onMouseLeave: () => setTip(null),
                style: { cursor: "pointer" },
              })
            }
          />
        </div>
      </motion.div>

      {/* Portal tooltip — renders above everything, follows cursor */}
      {tip &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tipPos.x + 14,
              top: tipPos.y - 48,
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
            }}
          >
            <b>
              {tip.count} contribution{tip.count !== 1 ? "s" : ""}
            </b>
            <br />
            {(() => {
              const d = new Date(tip.date);
              return `${d.getDate()} ${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
            })()}
          </div>,
          document.body,
        )}
    </section>
  );
};

export default GitHubStats;
