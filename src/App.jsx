import { Route, Routes, useLocation } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import styles from "./style";
import ScopeBackground from "./scope/ScopeBackground";
import Daemon from "./daemon/Daemon";
import Presence from "./presence/Presence";
import ScrollManager from "./components/ScrollManager";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home";
import IncidentsIndex from "./pages/IncidentsIndex";
import IncidentPage from "./pages/IncidentPage";
import CaseStudyPage from "./pages/CaseStudyPage";
import NotesIndex from "./pages/NotesIndex";
import CaseStudiesIndex from "./pages/CaseStudiesIndex";
import NotePage from "./pages/NotePage";
import NotFound from "./pages/NotFound";

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
