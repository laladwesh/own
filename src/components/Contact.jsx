import { aboutMe, socialMedia } from "../constants";
import { ports, serviceSpec as service } from "../lib/data";
import { now } from "../constants/now";
import SectionHeading from "./SectionHeading";
import { Switchable, Wide, yamlLines } from "./Manifest";
import Invite from "./Invite";
import { GITHUB_URL, ghLink, followersText, useFollowers } from "../lib/follow";

const find = (label) => socialMedia.find((s) => s.label === label)?.link;

const mailDraft = `${find("Email (Gmail)")}?subject=${encodeURIComponent("Let us work together")}`;

const Contact = () => {
  const n = useFollowers();
  const count = followersText(n);
  // The follow entry sits with the other ports; the number is left out when it is not known.
  const spec = {
    ...service,
    spec: { ports: [...service.spec.ports, { name: "github", action: "follow", ...(typeof n === "number" ? { followers: n } : {}), url: GITHUB_URL }] },
  };
  return (
  <section id="contact" className="section">
    <SectionHeading command="$ cat service.yaml" title="Contact" explain="contact" />
    <Switchable
      explain="contact"
      label="service.yaml"
      yaml={yamlLines(spec)}
      wide={
        <>
          {now.lookingFor && <p className="contact-open">Open to opportunities: {now.lookingFor}.</p>}
          <Wide
          rows={ports.map(([name, url]) => [
            name,
            <a key={name} href={url} target={url.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
              {url.replace(/^mailto:|^https?:\/\/(www\.)?/, "")}
            </a>,
          ])}
          />
          <Invite as="p" priority={2} className="contact-follow">
            <a {...ghLink}>Follow me on GitHub{count ? ` (${count})` : ""} &#8599;</a>
          </Invite>
        </>
      }
    />
    <p className="contact-cta">
      <span className="describe-cmd">$ hire avinash</span>
      <a className="btn-primary" href={mailDraft}>
        Email {aboutMe.name}
      </a>
    </p>
  </section>
  );
};

export default Contact;
