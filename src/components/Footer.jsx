import { siteDomain } from "../constants";

// Static status line. The deploy date is injected at build time (vite.config.js).
const Footer = () => (
  <footer className="site-footer">
    <p>
      status: running / last deploy {__BUILD_DATE__} / {siteDomain}
    </p>
  </footer>
);

export default Footer;
