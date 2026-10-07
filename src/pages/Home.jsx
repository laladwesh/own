import styles from "../style";
import {
  Hero,
  About,
  Pipeline,
  Incidents,
  Skills,
  Deployments,
  CaseStudies,
  Images,
  Dashboard,
  Releases,
  OpenSource,
  Education,
  Cronjobs,
  Ships,
  Contact,
} from "../components";

const Home = () => (
  <>
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
        <CaseStudies />
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
  </>
);

export default Home;
