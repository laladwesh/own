import { Link } from "react-router-dom";
import { SITE_PAGES } from "../lib/sitePages";
import SectionHeading from "./SectionHeading";

// A directory listing of the rest of the site. Each name is a link; the text after it says
// what is inside.
const ENTRIES = [
  { to: "/work", name: "work/", note: SITE_PAGES.work.blurb },
  { to: "/case-studies", name: "case-studies/", note: "things I built, and how they changed along the way" },
  { to: "/incidents", name: "incidents/", note: "postmortems of what broke, and what I changed" },
  { to: "/notes", name: "notes/", note: "things I fixed or got wrong, written down" },
  { to: "/background", name: "background/", note: SITE_PAGES.background.blurb },
  { to: "/infra", name: "infra/", note: SITE_PAGES.infra.blurb },
];

const Explore = () => (
  <section id="explore" className="section">
    <SectionHeading command="$ ls -l ~" title="Explore" />
    <ul className="explore-list">
      {ENTRIES.map((e) => (
        <li key={e.to}>
          <Link to={e.to} className="explore-name">
            {e.name}
          </Link>
          <span className="explore-note">{e.note}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default Explore;
