import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./style";

import {
  Navbar,
  Hero,
  Education,
  SkillsAndExperience,
  ExtraCurricular,
  Footer,
  OpenSource,
  Projects,
  BlogPosts,
  Loading,
  Achievements,
  GitHubStats,
  LeetCodeStats,
  GitHubRepos,
} from "./components";

import {
  AnimatedBackground,
  ScrollProgress,
  ScrollToTop,
} from "./components/ui";

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full overflow-x-hidden bg-[#050410] grain text-white">
      {/* ambient layers */}
      <AnimatedBackground />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loading key="loading" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10"
          >
            <ScrollProgress />
            <ScrollToTop />

            {/* Navbar */}
            <Navbar />

            {/* Hero */}
            <div className={`${styles.flexStart} pt-[88px]`}>
              <div className={`${styles.boxWidth}`}>
                <Hero />
              </div>
            </div>

            {/* Skills + Education */}
            <div className={`${styles.flexCenter} ${styles.paddingX}`}>
              <div className={`${styles.boxWidth}`}>
                <SkillsAndExperience />
                <Education />
              </div>
            </div>

            {/* Achievements */}
            <Achievements />

            {/* Stats, Projects, Repos, OSS, Extra-curricular */}
            <div className={`${styles.flexCenter} ${styles.paddingX}`}>
              <div className={`${styles.boxWidth}`}>
                <GitHubStats />
                <LeetCodeStats />
                <Projects />
                <GitHubRepos />
                <BlogPosts enabled={false} />
                <OpenSource />
                <ExtraCurricular />
              </div>
            </div>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
