import React, { useState, useEffect } from "react";
import { DiGitMerge, DiGitPullRequest } from "react-icons/di";
import { AiFillApi } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { fetchContributionsWithRetry } from "../lib/helperFunctions";

const RepoModal = ({ repo, prs, logoUrl, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

    <motion.div
      className="relative bg-[#0d0b1a] border border-purple-800 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col z-10 shadow-2xl shadow-purple-900/40"
      initial={{ scale: 0.92, y: 24, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.92, y: 24, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt={repo} className="w-8 h-8 rounded-full" />
          <h3 className="font-poppins font-semibold text-white">{repo}</h3>
          <span className="bg-purple-900/60 text-purple-300 text-xs px-2 py-0.5 rounded-full font-poppins">
            {prs.length} PRs
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm font-poppins">
          <thead className="sticky top-0 bg-[#0d0b1a] border-b border-gray-700">
            <tr>
              <th className="text-left px-6 py-3 text-gray-400 font-normal w-8">#</th>
              <th className="text-left px-4 py-3 text-gray-400 font-normal">Title</th>
              <th className="text-left px-4 py-3 text-gray-400 font-normal hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-gray-400 font-normal hidden md:table-cell">Changes</th>
              <th className="text-left px-4 py-3 text-gray-400 font-normal hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {prs.map((pr, i) => (
              <tr
                key={pr.id}
                className={`border-b border-gray-800 hover:bg-purple-900/10 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
              >
                <td className="px-6 py-3 text-gray-500">{pr.number}</td>
                <td className="px-4 py-3 max-w-[260px]">
                  <a
                    href={pr.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-purple-300 transition-colors truncate block"
                    title={pr.title}
                  >
                    {pr.title}
                  </a>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {pr.status === "MERGED" ? (
                    <span className="inline-flex items-center gap-1 text-violet-400">
                      <DiGitMerge size="0.9rem" /> Merged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-400">
                      <DiGitPullRequest size="0.9rem" /> Open
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                  {pr.linesAdded > 0 ? (
                    <>
                      <span className="text-green-500">+{pr.linesAdded}</span>
                      <span className="text-red-400 ml-1">-{pr.linesDeleted}</span>
                    </>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-500 whitespace-nowrap">
                  {pr.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  </motion.div>
);

const RepoCard = ({ repo, prs, onViewAll }) => {
  const featured = prs[0];
  const merged = prs.filter((p) => p.status === "MERGED").length;
  const open = prs.length - merged;

  return (
    <motion.div
      className="flex flex-col justify-between px-6 py-5 rounded-[20px] transition-all duration-300 border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 feature-card"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Repo header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={featured.logoUrl}
          alt={repo}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-poppins font-semibold text-white text-sm truncate">
            {featured.organization}
          </p>
          <p className="font-poppins text-dimWhite text-xs truncate italic">
            {repo}
          </p>
        </div>
        <div className="ml-auto flex gap-2 text-xs font-poppins flex-shrink-0">
          {merged > 0 && <span className="text-violet-400">{merged} merged</span>}
          {merged > 0 && open > 0 && <span className="text-gray-600">·</span>}
          {open > 0 && <span className="text-green-400">{open} open</span>}
        </div>
      </div>

      {/* Featured PR */}
      <div className="flex items-start gap-2 mb-4 flex-1">
        {featured.status === "MERGED" ? (
          <DiGitMerge size="1.1rem" className="text-violet-400 mt-0.5 flex-shrink-0" />
        ) : (
          <DiGitPullRequest size="1.1rem" className="text-green-500 mt-0.5 flex-shrink-0" />
        )}
        <a
          href={featured.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-poppins text-white text-sm hover:text-purple-300 transition-colors line-clamp-2"
          title={featured.title}
        >
          <span className="text-gray-500 mr-1">#{featured.number}</span>
          {featured.title}
        </a>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800">
        {featured.linesAdded > 0 ? (
          <span className="text-xs font-poppins">
            <span className="text-green-500">+{featured.linesAdded}</span>
            <span className="text-red-400 ml-1">-{featured.linesDeleted}</span>
          </span>
        ) : (
          <span />
        )}
        {prs.length > 1 ? (
          <button
            onClick={() => onViewAll(repo, prs, featured.logoUrl)}
            className="text-xs font-poppins text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          >
            View all {prs.length} PRs →
          </button>
        ) : (
          <span className="text-xs text-gray-600 font-poppins">1 contribution</span>
        )}
      </div>
    </motion.div>
  );
};

const OpenSource = () => {
  const [contributions, setContributions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const getContributions = async () => {
      const fetched = await fetchContributionsWithRetry();
      if (!fetched?.error) {
        setContributions(fetched);
        const g = fetched.reduce((acc, pr) => {
          if (!acc[pr.repo]) acc[pr.repo] = [];
          acc[pr.repo].push(pr);
          return acc;
        }, {});
        setGrouped(g);
      } else {
        setContributions(fetched);
      }
    };
    getContributions();
  }, []);

  return (
    <section id="openSource">
      <h1 className="flex-1 font-poppins font-semibold ss:text-[55px] text-[45px] text-white ss:leading-[80px] leading-[80px]">
        Open Source Contributions
      </h1>

      <div className="container px-2 py-5 mx-auto mb-8">
        {contributions.error ? (
          <div className="flex items-start gap-3 mt-6">
            <AiFillApi size="2rem" className="text-white hover:text-purple-300 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold font-poppins text-gradient">
                Something went wrong loading this section.
              </h2>
              <p className="font-poppins font-normal text-dimWhite mt-2">
                Please wait a few seconds and try reloading the page.
              </p>
            </div>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="font-poppins text-dimWhite mt-6">Loading contributions…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 md:mt-12">
            {Object.entries(grouped).map(([repo, prs]) => (
              <RepoCard
                key={repo}
                repo={repo}
                prs={prs}
                onViewAll={(repo, prs, logoUrl) => setModal({ repo, prs, logoUrl })}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <RepoModal
            repo={modal.repo}
            prs={modal.prs}
            logoUrl={modal.logoUrl}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default OpenSource;
