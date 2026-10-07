import { motion, MotionConfig } from "framer-motion";
import styles from "./style";
import ScopeBackground from "./scope/ScopeBackground";
import Daemon from "./daemon/Daemon";
import {
  Navbar,
  Hero,
  About,
  Pipeline,
  Incidents,
  Skills,
  Deployments,
  Images,
  Dashboard,
  Releases,
  OpenSource,
  Education,
  Cronjobs,
  Ships,
  Contact,
  Footer,
} from "./components";

const App = () => (
  <MotionConfig reducedMotion="user">
    <div className="w-full">
      <a href="#home" className="skip-link">Skip to content</a>
      <ScopeBackground />
      <Daemon />

      {/* One 200ms fade on load; nothing slides or zooms. */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <Navbar />

        <div className="pt-[80px]">
          <Hero />
        </div>

        <main className={`${styles.paddingX} flex justify-center`}>
          <div className={styles.boxWidth}>
            <About />
            <Pipeline />
            <Incidents />
            <Skills />
            <Deployments />
            <Images />
            <Dashboard />
            <Releases />
            <OpenSource />
            <Education />
            <Cronjobs />
            <Ships />
            <Contact />
          </div>
        </main>

        <div className={`${styles.paddingX} flex justify-center`}>
          <div className={styles.boxWidth}>
            <Footer />
          </div>
        </div>
      </motion.div>
    </div>
  </MotionConfig>
);

export default App;
