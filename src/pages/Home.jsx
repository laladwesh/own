import styles from "../style";
import { homeSeo } from "../lib/seo";
import { useSeo } from "../lib/useSeo";
import {
  Hero,
  About,
  CaseStudies,
  Incidents,
  Explore,
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
        <About />
        <CaseStudies />
        <Incidents />
        <Explore />
        <Contact />
      </div>
    </main>
  </>
  );
};

export default Home;
