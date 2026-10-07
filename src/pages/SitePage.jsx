import { Link } from "react-router-dom";
import styles from "../style";
import SectionHeading from "../components/SectionHeading";
import { Pipeline, Deployments, Images, OpenSource, Skills, Education, Releases, Cronjobs, Ships, Dashboard } from "../components";
import { SITE_PAGES } from "../lib/sitePages";
import { sitePageSeo } from "../lib/seo";
import { useSeo } from "../lib/useSeo";

const SECTIONS = { pipeline: Pipeline, deployments: Deployments, images: Images, openSource: OpenSource, skills: Skills, education: Education, releases: Releases, cronjobs: Cronjobs, ships: Ships, dashboard: Dashboard };

// One of the pages that hold what used to be homepage sections: work, background, infra.
const SitePage = ({ page }) => {
  const def = SITE_PAGES[page];
  useSeo(sitePageSeo(page));

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[128px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <SectionHeading as="h1" command={def.command} title={def.title} />
        <p className="page-intro">{def.intro}</p>
        <div className="site-page-sections">
          {def.sections.map((id) => {
            const Section = SECTIONS[id];
            return <Section key={id} />;
          })}
        </div>
        <p className="incident-more">
          <Link to="/">&larr; avinashgupta.in</Link>
        </p>
      </div>
    </main>
  );
};

export default SitePage;
