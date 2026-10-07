import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import styles from "./style";
import ScopeBackground from "./scope/ScopeBackground";
import Daemon from "./daemon/Daemon";
import Presence from "./presence/Presence";
import ScrollManager from "./components/ScrollManager";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home";
// Pages other than the homepage load on demand, so the first visit downloads less.
const IncidentsIndex = lazy(() => import("./pages/IncidentsIndex"));
const IncidentPage = lazy(() => import("./pages/IncidentPage"));
const CaseStudyPage = lazy(() => import("./pages/CaseStudyPage"));
const NotesIndex = lazy(() => import("./pages/NotesIndex"));
const CaseStudiesIndex = lazy(() => import("./pages/CaseStudiesIndex"));
const NotePage = lazy(() => import("./pages/NotePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  const { pathname } = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full">
        <a href={pathname === "/" ? "#home" : "#content"} className="skip-link">Skip to content</a>
        <ScopeBackground />
        <Daemon />
        <Presence />
        <ScrollManager />

        {/* One 200ms fade on load; nothing slides or zooms. */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <Navbar />

          <Suspense fallback={<main id="content" className="pt-[128px] pb-[96px]" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/incidents" element={<IncidentsIndex />} />
            <Route path="/incidents/:id" element={<IncidentPage />} />
            <Route path="/case-studies" element={<CaseStudiesIndex />} />
            <Route path="/projects/:slug" element={<CaseStudyPage />} />
            <Route path="/notes" element={<NotesIndex />} />
            <Route path="/notes/:slug" element={<NotePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>

          <div className={`${styles.paddingX} flex justify-center`}>
            <div className={styles.boxWidth}>
              <Footer />
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default App;
