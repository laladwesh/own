import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { LinkPreview } from "./LinkPreview";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillGithub, AiFillStar, AiFillHtml5 } from "react-icons/ai";
import { BsLink45Deg } from "react-icons/bs";
import {
  SiPython, SiJavascript, SiTypescript, SiReact, SiTailwindcss,
  SiBootstrap, SiNodedotjs, SiNextdotjs, SiExpress, SiSocketdotio,
  SiMongodb, SiMysql, SiRedis, SiDocker, SiKubernetes, SiGit,
  SiPostman, SiArduino, SiC, SiCplusplus, SiOpenai, SiNginx,
  SiVirtualbox, SiLinux, SiFigma, SiGraphql, SiPrisma, SiGoogledrive,
  SiCloudinary, SiGithubactions, SiFirebase, SiRedux, SiSentry,
  SiFramer, SiRazorpay, SiCloudflare, SiSass, SiVite,
} from "react-icons/si";
import { DiCss3 } from "react-icons/di";
import { FaAws, FaServer } from "react-icons/fa";
import { FaGolang } from "react-icons/fa6";
import projectsData from "../data/github-projects.json";

// ── Tech icon map ─────────────────────────────────────────────────────────────
const TECH_MAP = {
  "javascript":       SiJavascript,
  "typescript":       SiTypescript,
  "react":            SiReact,
  "react js":         SiReact,
  "react native":     SiReact,
  "react / rn":       SiReact,
  "next.js":          SiNextdotjs,
  "node.js":          SiNodedotjs,
  "express.js":       SiExpress,
  "express":          SiExpress,
  "mongodb":          SiMongodb,
  "mysql":            SiMysql,
  "redis":            SiRedis,
  "docker":           SiDocker,
  "kubernetes":       SiKubernetes,
  "nginx":            SiNginx,
  "python":           SiPython,
  "tailwind css":     SiTailwindcss,
  "tailwind":         SiTailwindcss,
  "socket.io":        SiSocketdotio,
  "websocket":        SiSocketdotio,
  "websockets":       SiSocketdotio,
  "firebase":         SiFirebase,
  "graphql":          SiGraphql,
  "prisma":           SiPrisma,
  "git":              SiGit,
  "github actions":   SiGithubactions,
  "cloudinary":       SiCloudinary,
  "scss":             SiSass,
  "sass":             SiSass,
  "bootstrap":        SiBootstrap,
  "html":             AiFillHtml5,
  "css":              DiCss3,
  "aws":              FaAws,
  "aws s3":           FaAws,
  "go":               FaGolang,
  "golang":           FaGolang,
  "linux":            SiLinux,
  "arduino":          SiArduino,
  "openai":           SiOpenai,
  "groq api":         SiOpenai,
  "figma":            SiFigma,
  "framer motion":    SiFramer,
  "framer":           SiFramer,
  "razorpay":         SiRazorpay,
  "cloudflare":       SiCloudflare,
  "redux":            SiRedux,
  "redux toolkit":    SiRedux,
  "sentry":           SiSentry,
  "google drive":     SiGoogledrive,
  "pm2":              FaServer,
  "render":           FaServer,
  "oracle vm":        SiVirtualbox,
  "c":                SiC,
  "c++":              SiCplusplus,
  "postman":          SiPostman,
  "vite":             SiVite,
  "gsap":             SiFramer,
  "adminjs":          FaServer,
  "nodemailer":       SiNodedotjs,
};
const resolveIcon = (name) => TECH_MAP[name.toLowerCase().trim()] ?? null;

// ── Category badge — uniform color ────────────────────────────────────────────
const getCatBadge = () => "text-gray-400 border-gray-700/40 bg-gray-800/20";

const PAGE_SIZE = 6; // 2 rows × 3 cols

// Round-robin interleave: one from each category in turn
function interleaveByCategory(items) {
  const groups = {};
  const order  = [];
  for (const item of items) {
    const cat = item.category || "Other";
    if (!groups[cat]) { groups[cat] = []; order.push(cat); }
    groups[cat].push(item);
  }
  const result = [];
  let i = 0;
  while (result.length < items.length) {
    let added = false;
    for (const cat of order) {
      if (groups[cat][i]) { result.push(groups[cat][i]); added = true; }
    }
    if (!added) break;
    i++;
  }
  return result;
}

// ── Page numbers ──────────────────────────────────────────────────────────────
function getPages(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const s = new Set([1, total, cur, cur - 1, cur + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...s].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

// ── Screenshot URL (same service as LinkPreview.jsx) ─────────────────────────
const shotUrl = (url) =>
  `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
const getDomain = (url) => {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
};

// ── Modal — card-matched styling + live-site hero ─────────────────────────────
const RepoModal = ({ project, onClose }) => {
  const [imgErr, setImgErr] = React.useState(false);
  if (!project) return null;

  const allIcons = (project.techStack || [])
    .map((t) => ({ name: t, Icon: resolveIcon(t) }))
    .filter((t) => t.Icon);

  const shot = project.homepage ? shotUrl(project.homepage) : null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.93, opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gradient-to-br from-[#0e0c1f] to-[#0a0815] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Hero screenshot ──────────────────────────────────────────────── */}
        {shot ? (
          <div className="relative w-full h-[200px] bg-[#0a0815] overflow-hidden rounded-t-2xl flex-shrink-0">
            {!imgErr ? (
              <img
                src={shot}
                alt={project.name}
                className="w-full h-full object-cover object-top"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <AiFillGithub size="2.5rem" className="text-gray-700" />
                <span className="font-poppins text-[11px] text-gray-600">Preview unavailable</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0815] via-[#0a081540] to-transparent pointer-events-none" />

            {/* Domain bar */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-3 flex items-center gap-2">
              <img
                src={`https://www.google.com/s2/favicons?domain=${getDomain(project.homepage)}&sz=16`}
                alt=""
                className="w-4 h-4 rounded-sm flex-shrink-0"
                onError={(e) => (e.target.style.display = "none")}
              />
              <a
                href={project.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="font-poppins text-[11px] text-purple-300 hover:text-white transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {getDomain(project.homepage)}
              </a>
              <span className="ml-auto font-poppins text-[10px] text-gray-600 flex-shrink-0">↗ open</span>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-gray-400 hover:text-white hover:bg-black/80 text-sm transition-all"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg leading-none transition-colors z-10"
          >
            ✕
          </button>
        )}

        {/* ── Content (mirrors card layout exactly) ───────────────────────── */}
        <div className="px-8 py-6">
          {/* Title + badge — same as card */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-xl font-semibold font-poppins text-gray-700 capitalize md:text-2xl group-hover:text-white text-gradient flex-1 min-w-0">
              {project.name}
            </h1>
            <span className={`flex-shrink-0 font-poppins text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mt-0.5 ${getCatBadge()}`}>
              {project.category}
            </span>
          </div>

          {/* Tech Stack — identical to card */}
          <p className="font-poppins font-normal text-dimWhite mt-3 mb-2">Tech Stack</p>
          <div className="text-gray-500 capitalize dark:text-gray-300">
            <div className="flex flex-wrap gap-4">
              {allIcons.map(({ name, Icon }) => (
                <div key={name} className="text-dimWhite text-[20px] hover:text-purple-300 tooltip">
                  <Icon />
                  <span className="tooltiptext">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary — identical to card */}
          <p className="mt-6 text-gray-500 dark:text-gray-300 font-poppins">
            {project.summary}
          </p>

          {/* Highlights */}
          {project.highlights?.length > 0 && (
            <div className="mt-5">
              <p className="font-poppins font-semibold text-white text-[13px] mb-2.5">Key Features</p>
              <ul className="space-y-2">
                {project.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 font-poppins text-[13px] text-gray-400">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links row — identical to card */}
          <div className="flex mt-4 -mx-2 items-center gap-1">
            <a href={project.url} target="_blank" rel="noopener noreferrer" title="GitHub" onClick={(e) => e.stopPropagation()}>
              <AiFillGithub size="2rem" className="text-white hover:text-purple-300 transition-colors" />
            </a>
            {project.homepage && (
              <a href={project.homepage} target="_blank" rel="noopener noreferrer" title="Live Site" onClick={(e) => e.stopPropagation()}>
                <BsLink45Deg size="2rem" className="text-white hover:text-purple-300 transition-colors" />
              </a>
            )}
            {project.stars > 0 && (
              <span className="ml-auto flex items-center gap-1 font-poppins text-[12px] text-gray-500">
                <AiFillStar className="text-gray-500" size="0.85rem" />
                {project.stars}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// ── Card — exact same classes as Projects.jsx ────────────────────────────────
const RepoCard = ({ project, index, onClick }) => {
  const techIcons = (project.techStack || [])
    .map((t) => ({ name: t, Icon: resolveIcon(t) }))
    .filter((t) => t.Icon)
    .slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onClick}
      className="cursor-pointer px-8 py-6 transition-colors duration-300 transform border rounded-xl hover:border-transparent group dark:border-gray-700 dark:hover:border-transparent feature-card flex flex-col"
    >
      <div className="flex flex-col items-start">
        <div className="w-full">
          {/* Title — exact copy of Projects.jsx h1 */}
          <h1 className="text-xl font-semibold font-poppins text-gray-700 capitalize md:text-2xl group-hover:text-white text-gradient">
            {project.name}
          </h1>

          {/* Category badge */}
          <span className={`inline-block mt-2 font-poppins text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${getCatBadge(project.category)}`}>
            {project.category}
          </span>

          {/* Tech Stack label + icons — exact copy */}
          <p className="font-poppins font-normal text-dimWhite mt-3 mb-2">Tech Stack</p>
          <div className="text-gray-500 capitalize dark:text-gray-300 group-hover:text-gray-300">
            <div className="flex flex-wrap gap-4">
              {techIcons.map(({ name, Icon }) => (
                <div
                  key={name}
                  className="text-dimWhite text-[20px] hover:text-purple-300 tooltip"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon />
                  <span className="tooltiptext">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content — exact copy of Projects.jsx <p> */}
      <p className="mt-6 text-gray-500 dark:text-gray-300 group-hover:text-gray-300 font-poppins line-clamp-3">
        {project.summary}
      </p>

      {/* Links — exact same sizes/classes as Projects.jsx */}
      <div className="flex mt-4 -mx-2 items-center gap-1">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          onClick={(e) => e.stopPropagation()}
        >
          <AiFillGithub size="2rem" className="text-white hover:text-purple-300" />
        </a>
        {project.homepage && (
          <LinkPreview url={project.homepage}>
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              title="Live Site"
              onClick={(e) => e.stopPropagation()}
            >
              <BsLink45Deg size="2rem" className="text-white hover:text-purple-300" />
            </a>
          </LinkPreview>
        )}
        {project.stars > 0 && (
          <span className="ml-auto flex items-center gap-1 font-poppins text-[12px] text-gray-500">
            <AiFillStar className="text-gray-500" size="1.5rem" />
            {project.stars}
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ page, total, onChange }) => {
  if (total <= 1) return null;
  const pages = getPages(page, total);
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 select-none">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="font-poppins text-[12px] px-4 py-2 rounded-xl border border-gray-700 text-dimWhite hover:border-purple-600 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
      >
        ← Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="font-poppins text-[12px] text-gray-600 w-7 text-center">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`font-poppins text-[12px] font-medium w-9 h-9 rounded-xl transition-all duration-200 ${
              p === page
                ? "bg-purple-700 text-white shadow-[0_0_18px_rgba(139,92,246,0.5)] border border-purple-500"
                : "text-gray-500 border border-transparent hover:border-gray-700 hover:text-white hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="font-poppins text-[12px] px-4 py-2 rounded-xl border border-gray-700 text-dimWhite hover:border-purple-600 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
      >
        Next →
      </button>
    </div>
  );
};

// ── Section ───────────────────────────────────────────────────────────────────
const GitHubRepos = () => {
  const [activeCategory,   setActiveCategory]   = useState("All");
  const [page,             setPage]             = useState(1);
  const [selectedProject,  setSelectedProject]  = useState(null);

  // Preload all screenshots on mount so modal opens instantly
  useEffect(() => {
    projectsData.forEach((p) => {
      if (p.homepage) {
        const img = new Image();
        img.src = shotUrl(p.homepage);
      }
    });
  }, []);

  const categories = useMemo(() => {
    const seen = new Set();
    const out  = ["All"];
    for (const p of projectsData) {
      if (p.category && !seen.has(p.category)) { seen.add(p.category); out.push(p.category); }
    }
    return out;
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory !== "All")
      return projectsData.filter((p) => p.category === activeCategory);
    return interleaveByCategory(projectsData);
  }, [activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const slice      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setCategory = (cat) => { setActiveCategory(cat); setPage(1); };
  const setPageNum  = (p)   => {
    setPage(p);
    const el = document.getElementById("githubRepos");
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: "smooth" });
  };

  if (!projectsData.length) {
    return (
      <section id="githubRepos" className="mb-16">
        <h1 className="font-poppins font-semibold ss:text-[55px] text-[45px] text-white ss:leading-[80px] leading-[80px] mb-5">
          All Repositories
        </h1>
        <div className="rounded-xl border border-gray-700 p-12 text-center">
          <p className="font-poppins text-dimWhite mb-2">No repository data yet.</p>
          <p className="font-poppins text-[12px] text-gray-600">
            Run{" "}
            <code className="bg-gray-800/80 text-[#d8b4fe] px-2 py-0.5 rounded font-mono">npm run generate:projects</code>
            {" "}to populate.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="githubRepos" className="overflow-hidden mb-16">
      {/* Heading */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="mb-6"
      >
        <h1 className="font-poppins font-semibold ss:text-[55px] text-[45px] text-white ss:leading-[80px] leading-[80px]">
          All Repositories
        </h1>
        <p className="font-poppins font-normal text-dimWhite text-[15px] -mt-1">
          {projectsData.length} public repos · AI-summarized
        </p>
      </motion.div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`font-poppins text-[12px] font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
              activeCategory === cat
                ? "bg-purple-700 border-purple-600 text-white shadow-[0_0_14px_rgba(139,92,246,0.4)]"
                : "border-gray-700 text-dimWhite hover:border-purple-600 hover:text-white"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1.5 text-[10px] opacity-50">
                {projectsData.filter((p) => p.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-poppins text-[11px] text-gray-600">
          Showing{" "}
          <span className="text-gray-400">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span>
          {" "}of <span className="text-gray-400">{filtered.length}</span> repos
        </p>
        {totalPages > 1 && (
          <p className="font-poppins text-[11px] text-gray-700">Page {page} / {totalPages}</p>
        )}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}__${page}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {slice.map((project, index) => (
            <RepoCard
              key={project.name}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="font-poppins text-dimWhite text-[13px] text-center py-12">
          No repositories in this category.
        </p>
      )}

      <Pagination page={page} total={totalPages} onChange={setPageNum} />

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <RepoModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GitHubRepos;
