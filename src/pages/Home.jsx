import styles from "../style";
import { homeSeo } from "../lib/seo";
import { useSeo } from "../lib/useSeo";
import { GlossScope } from "../components/Gloss";
import {
  Hero,
  About,
  Pipeline,
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

const Home = () => {
  useSeo(homeSeo);
  return (
  <>
    <div className="pt-[80px]">
      <Hero />
    </div>

    <main className={`${styles.paddingX} flex justify-center`}>
      <div className={styles.boxWidth}>
        <GlossScope>
          <About />
        </GlossScope>
        <GlossScope>
          <Pipeline />
        </GlossScope>
        <GlossScope>
          <Skills />
        </GlossScope>
        <GlossScope>
          <Deployments />
        </GlossScope>
        <GlossScope>
          <CaseStudies />
        </GlossScope>
        <GlossScope>
          <Images />
        </GlossScope>
        <GlossScope>
          <Dashboard />
        </GlossScope>
        <GlossScope>
          <Releases />
        </GlossScope>
        <GlossScope>
          <OpenSource />
        </GlossScope>
        <GlossScope>
          <Education />
        </GlossScope>
        <GlossScope>
          <Cronjobs />
        </GlossScope>
        <GlossScope>
          <Ships />
        </GlossScope>
        <GlossScope>
          <Contact />
        </GlossScope>
      </div>
    </main>
  </>
  );
};

export default Home;
